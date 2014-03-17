
AbstractStorage = require './abstract-storage'

debug = require('debug') 'S3-Storage'

async = require 'async'
AWS = require 'aws-sdk'
path = require 'path'
_ = require 'lodash'
fs = require 'fs'
{Writable} = require('stream')

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
    cbFired = false

    onEnd = (err, info) ->
      debug('End reading info for "%s" that results in: %j', file, info)
      if err
        debug('Error reading info for "%s" : %j', file, err)
      if err?.code == 'NotFound' or err?.code == 'NoSuchKey'
        err = null
        info = null
      unless cbFired
        dom.exit()
        cb err, info
        cbFired = true

    dom = require('domain').create()
    dom.on 'error', (err) -> onEnd err if err
    dom.run =>
      @_S3.headObject Key: @_filepath(file), onEnd

  createReadStream: (file) ->
    debug('Create readStream for "%s"', file)
    stream = @_S3
      .getObject(Key: @_filepath(file))
      .createReadStream()
    stream.on 'error', (err) ->
      debug('Error in readStream for "%s" : %j', file, err)
      if err.code != 'NotFound' and err.code != 'NoSuchKey'
        throw err
    return stream

  requestWriteStream: (file, info, cb) ->
    @_validWriteInfo info
    stream = new S3WriteStream @_S3, @_filepath(file), info

    # Trick to be compatible with local storage
    stream.on 'end', -> stream.emit 'close'

    cb null, stream

  deleteFile: (file, cb) ->
    @_S3.deleteObject Key: @_filepath(file), cb

  deleteCachedFiles: (file, cb) ->
    keys = null
    async.series [
      (done) =>
        @_S3.listObjects
          Prefix: @_filepath(file)
        , (err, _keys) ->
          keys = _keys
          done err
      (done) =>
        unless keys?.Contents?.length
          return done()
        @_S3.deleteObjects
          Delete:
            Objects: keys?.Contents.map (k) ->
              Key: k.Key
        , done
    ], cb

  _filepath: (file) ->
    path.join(@options.path, file)

module.exports = S3Storage