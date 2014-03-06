
{httpError} = require '../lib/utils'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging

    amaging.file.requestWriteStream (err, stream) ->
      return next err if err

      req.pipe(stream)
      req.on 'end', ->
        res.send
          success: true
          file: amaging.file.info
