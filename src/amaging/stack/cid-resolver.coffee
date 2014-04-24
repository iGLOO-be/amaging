
{httpError} = require '../lib/utils'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging
    params = req.params

    unless params.cid
      return httpError 403, 'CustomerId could not be found.', res

    customers = amaging.options?.customers
    customer = customers?[params.cid]

    unless customer
      return httpError 403, 'CustomerId could not be found.', res

    amaging.customer = customer
    amaging.customer.id = params.cid

    next()
