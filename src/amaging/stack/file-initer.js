
import async from 'async'

import { httpError } from '../lib/utils'
import File from '../storage/file'
import CacheFile from '../storage/cache-file'

export default () =>
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
