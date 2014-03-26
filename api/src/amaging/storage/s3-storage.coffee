
AbstractStorage = require './abstract-storage'

debug = require('debug') 'S3-Storage'

async = require 'async'
AWS = require 'aws-sdk'
path = require 'path'
_ = require 'lodash'
knox = require 'knox'

class S3Storage extends AbstractStorage
  constructor: (@options) ->
    @_S3 = new AWS.S3
      accessKeyId: @options.key
      secretAccessKey: @options.secret
      region: @options.region
      params:
        Bucket: @options.bucket

    @_S3_knox = new knox.createClient(
      key: @options.key
      secret: @options.secret
      region: @options.region
      bucket: @options.bucket
    )

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
        process.nextTick ->
          cb err, info
        cbFired = true

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

    headers =
      'content-type': info.ContentType
      'content-length': info.ContentLength

    stream = @_S3_knox.put(@_filepath(file), headers)
    stream.on 'response', -> stream.emit 'close'

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
