
AbstractStorage = require './abstract-storage'

debug = require('debug') 'amaging:storage:s3'

async = require 'async'
path = require 'path'
_ = require 'lodash'
knox = require 'knox'
Boom = require 'boom'


InvalidResponse = (method, response) ->
  Boom.create 500, "Invalid #{method.toUpperCase()} response from S3. (Status: #{response.statusCode})",
    response: response

class S3Storage extends AbstractStorage
  constructor: (@options) ->
    @_S3_knox = new knox.createClient(
      key: @options.key
      secret: @options.secret
      region: @options.region
      bucket: @options.bucket
    )

  readInfo: (file, cb) ->
    debug('Start reading info for "%s"', file)

    @_S3_knox.headFile @_filepath(file), (err, res) ->
      return cb err if err
      return cb() if res.statusCode == 404
      return cb InvalidResponse 'head', res if res.statusCode != 200

      cb null,
        ContentType: res.headers['content-type']
        ContentLength: res.headers['content-length']
        ETag: res.headers['etag']
        LastModified: res.headers['last-modified']

  requestReadStream: (file, cb) ->
    debug('Create readStream for "%s"', file)
    @_S3_knox.getFile(@_filepath(file), (err, s3Res) ->
      cb err, s3Res
    )

  requestWriteStream: (file, info, cb) ->
    @_validWriteInfo info

    headers =
      'content-type': info.ContentType
      'content-length': info.ContentLength

    stream = @_S3_knox.put(@_filepath(file), headers)

    stream.on 'response', (res) ->
      if res.statusCode != 200
        stream.emit 'error', InvalidResponse 'put', res

    cb null, stream

  deleteFile: (file, cb) ->
    @_S3_knox.deleteFile @_filepath(file), cb

  deleteCachedFiles: (file, cb) ->
    keys = null
    async.series [
      (done) =>
        debug('Begin listing keys')

        @_S3_knox.list { prefix: @_filepath(file) }, (err, _keys) ->
          keys = _keys
          done err
      (done) =>
        debug('Proceed to delete')
        unless keys?.Contents?.length
          return done()

        @_S3_knox.deleteMultiple keys?.Contents.map((k) ->
          k.Key
        ), (err, res) ->
          done err
    ], cb

  _filepath: (file) ->
    path.join(@options.path, file)

module.exports = S3Storage
