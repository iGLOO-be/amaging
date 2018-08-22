
import File from '../storage/file'
import CacheFile from '../storage/cache-file'

export default () =>
  async function (req, res, next) {
    const { amaging } = req
    const { params } = req

    const [file, cacheFile] = await Promise.all([
      File.create(
        amaging.storage,
        amaging.cacheStorage,
        params.file
      ),
      CacheFile.create(
        amaging.cacheStorage,
        params.file
      )
    ])

    amaging.file = file
    amaging.cacheFile = cacheFile

    next()
  }
