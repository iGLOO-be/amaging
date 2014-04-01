
{httpError} = require '../lib/utils'
_ = require 'lodash'

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

    # Default options
    _.merge amaging.options,
      cache:
        cacheControl: 'public'
        maxAge: 604800 # 7 days
        etag: true


    next()
