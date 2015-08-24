
{httpError} = require '../lib/utils'
async = require 'async'

debug = require('debug') 'amaging:writer:default'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging

    # Valid headers
    contentLength = req.headers['content-length']
    contentType = req.headers['content-type']

    debug('Start default writer with %j',
      contentLength: contentLength
      contentType: contentType
    )

    if contentType.match /^multipart\/form-data/
      return next()

    unless contentLength and contentType
      debug('Abort default writer due to missing headers')
      return next httpError 403, 'Missing header(s)'

    debug('Start rewriting file...')

    stream = null
    async.series [
      (done) ->
        debug('Request write stream.')
        amaging.file.requestWriteStream
          ContentLength: contentLength
          ContentType: contentType
        , (err, _stream) ->
          stream = _stream
          done err
      (done) ->
        debug('Pipe in stream.')
        stream.on 'close', done
        req.pipe stream
      (done) ->
        debug('Read info.')
        amaging.file.readInfo done
    ], (err) ->
      return next err if err

      debug('End default writer.')

      res.send
        success: true
        file: amaging.file.info
