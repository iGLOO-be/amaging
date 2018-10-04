
import Boom from 'boom'

export default () =>
  function (req, res, next) {
    const { amaging } = req
    const { params } = req

    if (!params.cid) {
      throw Boom.forbidden('CustomerId could not be found.')
    }

    const customers = amaging.options != null ? amaging.options.customers : undefined
    const customer = customers != null ? customers[params.cid] : undefined

    if (!customer) {
      throw Boom.forbidden('CustomerId could not be found.')
    }

    amaging.customer = customer
    amaging.customer.id = params.cid

    return next()
  }
