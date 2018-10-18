
import LocalStorage from '../storage/local-storage'
import S3Storage from '../storage/s3-storage'

const createStorage = (type, options, amaging) => {
  let Storage
  if (type === 'local') {
    Storage = LocalStorage
  } else if (type === 's3') {
    Storage = S3Storage
  }
  if (!Storage) {
    throw new Error(`Invalid storage type: ${type}`)
  }
  const storage = new Storage(options, amaging)
  return storage
}

export default () =>
  function (req, res, next) {
    const { amaging } = req
    const { customer } = amaging

    amaging.storage = createStorage(
      customer.storage.type,
      customer.storage.options,
      amaging
    )
    amaging.cacheStorage = createStorage(
      customer.cacheStorage.type,
      customer.cacheStorage.options,
      amaging
    )

    return next()
  }
