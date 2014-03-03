
{httpError} = require '../lib/utils'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging

    unless amaging.file.exists()
      return httpError 404, 'File not found', res

    stream = amaging.file.createReadStream()
    stream.pipe(res)
