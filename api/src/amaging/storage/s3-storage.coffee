
AbstractStorage = require './abstract-storage'

debug = require('debug') 'S3-Storage'

AWS = require 'aws-sdk'
path = require 'path'
_ = require 'lodash'
fs = require 'fs'
{Readable} = require('stream')
{Writable} = require('stream')

class S3ReadStream extends Readable
  constructor: (@_bucket, @_key) ->
    super

  _read: ->
    if @_fetched
      return @push null

    @_bucket.getObject
      Key: @_key
    , (err, data) =>
      @_fetched = true
      @push data.Body


class S3WriteStream extends Writable
  constructor: (@_bucket, file, @_data = {}) ->
    @_data.Key = file
    super

  _write: (chunk, encoding, cb) ->
    unless Buffer.isBuffer chunk
      chunk = new Buffer chunk

    if @_buffer
      @_buffer = Buffer.concat(chunk)
    else
      @_buffer = chunk

    cb()

  end: (chunk, encoding, cb) ->
    @_data.Body = @_buffer
    #console.log @_data
    @_bucket.putObject @_data, (err, data) =>
      if err
        @emit 'error', err
      else
        @emit 'end'


class S3Storage extends AbstractStorage
  constructor: (@options) ->
    @_S3 = new AWS.S3
      accessKeyId: @options.key
      secretAccessKey: @options.secret
      region: @options.region
      params:
        Bucket: @options.bucket

  readInfo: (file, cb) ->
    debug('Start reading info for "%s"', file)
    @_S3.headObject Key: @_filepath(file), (err, info) =>
      debug('End reading info for "%s" that results in: %j', file, info)
      if err?.code == 'NotFound'
        info = null
        return cb()
      cb err, info

  createReadStream: (file) ->
    new S3ReadStream @_S3, @_filepath(file)

  requestWriteStream: (file, info, cb) ->
    @_validWriteInfo info
    stream = new S3WriteStream @_S3, @_filepath(file), info
    cb null, stream

  _filepath: (file) ->
    path.join(@options.path, file)

module.exports = S3Storage
