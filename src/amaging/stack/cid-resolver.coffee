
{httpError} = require '../lib/utils'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging
    params = req.params

    unless params.cid
      return next httpError 403, 'CustomerId could not be found.'

    customers = amaging.options?.customers
    customer = customers?[params.cid]

    unless customer
      return next httpError 403, 'CustomerId could not be found.'

    amaging.customer = customer
    amaging.customer.id = params.cid

    next()
