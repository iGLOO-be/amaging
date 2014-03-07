
{httpError} = require '../lib/utils'
async = require 'async'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging

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
