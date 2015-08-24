
{httpError} = require '../lib/utils'

debug = require('debug') 'amaging:reader:default'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging
    customer = amaging.options.cache

    debug('Start default reader for file: %j', amaging.file)

    unless amaging.file.exists()
      debug('Stop default reader cause to not found file.')
      return next httpError 404, 'File not found'

    debug('File exists!')

    res.setHeader('Content-Length', amaging.file.contentLength())
    res.setHeader('Content-Type', amaging.file.contentType())
    res.setHeader('Etag', amaging.file.eTag())
    res.setHeader('Cache-Control', 'max-age=' + customer['maxAge'] + ', ' + customer['cacheControl'])
    res.setHeader('Last-Modified', amaging.file.lastModified())

    amaging.file.requestReadStream (err, stream) ->
      return next err if err

      debug('Pipe stream in response.')
      stream.on 'error', (err) ->
        if err.code != 'ENOENT' and err.code != 'NotFound' and err.code != 'NoSuchKey'
          next err
        else
          next httpError 404, 'File not found'
      stream.pipe(res)
