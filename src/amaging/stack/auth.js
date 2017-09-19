const {httpError} = require('../lib/utils')
const crypto = require('crypto')
const domain = require('domain') // eslint-disable-line
const debug = require('debug')('amaging:auth')
const PolicyFactory = require('@igloo/igloo-amaging-policy')
const Policy = require('@igloo/igloo-amaging-policy/lib/policy')

const headerUserId = 'x-authentication'
const headerToken = 'x-authentication-token'
const headerPolicy = 'x-authentication-policy'

const hash = input =>
  crypto
    .createHash('sha1')
    .update(input)
    .digest('hex')

module.exports = () =>
  function (req, res, next) {
    const { amaging } = req
    const { params } = req
    const { headers } = req

    const result403 = () => next(httpError(403, 'Not Authorized !'))

    const cid = amaging.customer.id

    // Retrieve token
    const sha = headers[headerToken]
    if (!sha) {
      debug(`403: ${headerToken} header not found`)
      return result403()
    }

    // Retrieve user id
    const userId = headers[headerUserId]
    if (!userId) {
      debug(`403: ${headerUserId} header not found`)
      return result403()
    }

    // Retrive secret
    const secret = amaging.customer.access != null ? amaging.customer.access[userId] : undefined
    if (!secret) {
      debug('403: bad cid secret')
      return result403()
    }

    // # Policy
    if (headers[headerPolicy]) {
      debug('Start Policy authentification')

      const policyFactory = new PolicyFactory(secret)
      const d = domain.create()

      d.on('error', next)
      return d.run(() =>
        process.nextTick(function () {
          debug('Try to create policy with: ', headers[headerPolicy], headers[headerToken])
          const policy = policyFactory.create(headers[headerPolicy], headers[headerToken])
          if (!policy) {
            debug('403: Policy creation failed')
            return result403()
          }

          amaging.policy = policy

          policy.set('key', params.file)

          for (let val = 0; val < amaging.auth.headers.length; val++) {
            const header = amaging.auth.headers[val]
            policy.set(header, val)
          }

          return next()
        })
      )

    // Traditional authentification
    } else {
      amaging.policy = new Policy({})

      // Data to be hashed
      const fileName = params.file

      // Prepare string to hash
      let str = cid + userId + secret + fileName

      // Is there another info to add in hash ?
      for (let header of Array.from(amaging.auth.headers)) {
        const val = headers[header]

        if (!val) {
          return result403()
        }

        str += val
      }

      debug('Proceed to authentication ...')
      const newSHA = hash(str)
      debug(`newSHA: ${newSHA}`)
      if (sha.toLowerCase() !== newSHA.toLowerCase()) {
        debug('403: sha integrity failed')
        return result403()
      }

      debug('Authentication Success')
      return next()
    }
  }
