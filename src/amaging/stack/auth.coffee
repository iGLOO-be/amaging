{httpError} = require '../lib/utils'
crypto = require 'crypto'
domain = require 'domain'
debug = require('debug') 'auth'
PolicyFactory = require 'igloo-amaging-policy'
Policy = require 'igloo-amaging-policy/lib/policy'

headerUserId = 'x-authentication'
headerToken = 'x-authentication-token'
headerPolicy = 'x-authentication-policy'

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

    ## Policy
    if headers[headerPolicy]
      debug('Start Policy authentification')

      policyFactory = new PolicyFactory(secret)
      d = domain.create()

      d.on 'error', (err) ->
        if (err.name and err.name == 'PolicyError')
          return result403(err.message)
        else
          next(err)

      d.run ->
        process.nextTick ->
          debug('Try to create policy with: ', headers[headerPolicy], headers[headerToken])
          policy = policyFactory.create(headers[headerPolicy], headers[headerToken])
          unless policy
            debug "403: Policy creation failed"
            return result403()

          amaging.policy = policy

          policy.set 'key', params.file

          for header, val in amaging.auth.headers
            policy.set header, val

          next()

    # Traditional authentification
    else
      amaging.policy = new Policy({})

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
      if sha.toLowerCase() != new_sha.toLowerCase()
        debug '403: sha integrity failed'
        return result403()

      debug 'Authentication Success'
      return next()
