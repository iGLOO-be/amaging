
const {httpError} = require('../lib/utils')

module.exports = () =>
  function (req, res, next) {
    const { amaging } = req
    const { params } = req

    if (!params.cid) {
      return next(httpError(403, 'CustomerId could not be found.'))
    }

    const customers = amaging.options != null ? amaging.options.customers : undefined
    const customer = customers != null ? customers[params.cid] : undefined

    if (!customer) {
      return next(httpError(403, 'CustomerId could not be found.'))
    }

    amaging.customer = customer
    amaging.customer.id = params.cid

    return next()
  }
