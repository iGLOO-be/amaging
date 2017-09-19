
const AbstractStorage = require('../storage/abstract-storage')

module.exports = () =>
  function (req, res, next) {
    const { amaging } = req
    const { customer } = amaging

    amaging.storage = AbstractStorage.create(
      customer.storage.type,
      customer.storage.options
    )
    amaging.cacheStorage = AbstractStorage.create(
      customer.cacheStorage.type,
      customer.cacheStorage.options
    )

    return next()
  }
