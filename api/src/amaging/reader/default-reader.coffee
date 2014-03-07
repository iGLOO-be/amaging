
{httpError} = require '../lib/utils'

debug = require('debug') 'default-reader'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging

    debug('Start default reader for file: %j', amaging.file)

    unless amaging.file.exists()
      debug('Stop default reader cause to not found file.')
      return httpError 404, 'File not found', res

    res.set('Content-Type', amaging.file.contentType())

    stream = amaging.file.createReadStream()
    stream.pipe(res)
