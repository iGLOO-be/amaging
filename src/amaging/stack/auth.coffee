{httpError} = require '../lib/utils'
crypto = require 'crypto'
debug = require('debug') 'auth'

headerUserId = 'x-authentication'
headerToken = 'x-authentication-token'

hash = (input) ->
  crypto
    .createHash('sha1')
    .update(input)
    .digest('hex')

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging
    params = req.params
    headers = req.headers

    result403 = ->
      httpError 403, 'Not Authorized !', res

    cid = amaging.customer.id

    # Retrieve token
    sha = headers[headerToken]
    unless sha
      debug "403: #{headerToken} header not found"
      return result403()

    # Retrieve user id
    userId = headers[headerUserId]
    unless userId
      debug "403: #{headerUserId} header not found"
      return result403()

    # Retrive secret
    secret = amaging.customer.access?[userId]
    unless secret
      debug '403: bad cid secret'
      return result403()

    # Data to be hashed
    fileName = params.file

    # Prepare string to hash
    str = cid + userId + secret + fileName

    # Is there another info to add in hash ?
    for header in amaging.auth.headers
      val = headers[header]

      unless val
        return result403()

      str += val

    debug 'Proceed to authentication ...'
    new_sha = hash(str)
    debug 'new_sha: ' + new_sha
    if sha != new_sha
      debug '403: sha integrity failed'
      return result403()

    debug 'Authentication Success'
    return next()
