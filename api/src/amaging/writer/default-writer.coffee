
{httpError} = require '../lib/utils'
async = require 'async'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging

    # Valid headers
    contentLength = req.headers['content-length']
    contentType = req.headers['content-type']

    unless contentLength and contentType
      return httpError 403, 'Missing header(s)', res

    stream = null
    async.series [
      (done) ->
        amaging.file.requestWriteStream
          ContentLength: req.headers['content-length']
          ContentType: req.headers['content-type']
        , (err, _stream) ->
          stream = _stream
          done err
      (done) ->
        req.pipe stream
        req.on 'end', done
      (done) ->
        amaging.file.readInfo done
    ], (err) ->
      return next err if err

      res.send
        success: true
        file: amaging.file.info
