
async = require 'async'

{httpError} = require '../lib/utils'
File = require '../storage/file'
CacheFile = require '../storage/cache-file'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging
    params = req.params

    unless params.file
      return httpError 404, 'File not found', res

    async.parallel [
      (done) -> amaging.file = File.create amaging.storage, params.file, done
      (done) -> amaging.cacheFile = CacheFile.create amaging.cacheStorage, params.file, done
    ], next
