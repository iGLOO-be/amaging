
import AbstractStorage from '../storage/abstract-storage'

export default () =>
  function (req, res, next) {
    const { amaging } = req
    const { customer } = amaging

    amaging.storage = AbstractStorage.create(
      customer.storage.type,
      customer.storage.options,
      amaging
    )
    amaging.cacheStorage = AbstractStorage.create(
      customer.cacheStorage.type,
      customer.cacheStorage.options,
      amaging
    )

    return next()
  }
