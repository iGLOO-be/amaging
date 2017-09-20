
const async = require('async')

const {httpError} = require('../lib/utils')
const File = require('../storage/file')
const CacheFile = require('../storage/cache-file')

module.exports = () =>
  function (req, res, next) {
    const { amaging } = req
    const { params } = req

    if (!params.file) {
      return next(httpError(404, 'File not found'))
    }

    return async.parallel([
      done => {
        amaging.file = File.create(
          amaging.storage,
          amaging.cacheStorage,
          params.file,
          done
        )
      },
      done => {
        amaging.cacheFile = CacheFile.create(
          amaging.cacheStorage,
          params.file,
          done
        )
      }
    ], next)
  }
