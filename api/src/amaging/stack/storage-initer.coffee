
AbstractStorage = require '../storage/abstract-storage'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging
    customer = amaging.customer

    amaging.storage = AbstractStorage.create customer.storage.type, customer.storage.options
    amaging.cacheStorage = AbstractStorage.create customer.cacheStorage.type, customer.cacheStorage.options

    next()
