
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
    stream.on 'error', (err) ->
      if err.code != 'ENOENT' and err.code != 'NotFound' and err.code != 'NoSuchKey'
        next err
      else
        httpError 404, 'File not found', res
    stream.pipe(res)
