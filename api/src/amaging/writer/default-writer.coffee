
{httpError} = require '../lib/utils'
async = require 'async'

debug = require('debug') 'default-writer'

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

    if contentType.indexOf('multipart/form-data') >= 0
      return next()

    unless contentLength and contentType
      debug('Abort default writer due to missing headers')
      return httpError 403, 'Missing header(s)', res

    debug('Start rewriting file...')

    stream = null
    async.series [
      (done) ->
        debug('Request write stream.')
        amaging.file.requestWriteStream
          ContentLength: req.headers['content-length']
          ContentType: req.headers['content-type']
        , (err, _stream) ->
          stream = _stream
          done err
      (done) ->
        debug('Pipe in stream.')
        req.pipe stream
        req.on 'end', done
      (done) ->
        debug('Read info.')
        amaging.file.readInfo done
    ], (err) ->
      return next err if err

      res.send
        success: true
        file: amaging.file.info
