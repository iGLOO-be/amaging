
{httpError} = require '../lib/utils'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging

    stream = amaging.file.createWriteStream()
    req.pipe(stream)
    req.on 'end', ->
      res.send
        success: true
        file: amaging.file.info
