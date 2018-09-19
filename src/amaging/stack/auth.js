import { httpError } from '../lib/utils'
import crypto from 'crypto'
import domain from 'domain' // eslint-disable-line
import { parse, legacyParse, getAccessKey, Policy } from '@igloo-be/amaging-policy'
import { AUTH_POLICY_LEGACY_USED, AUTH_LEGACY_USED } from '../events'
import debugFactory from 'debug'
const debug = debugFactory('amaging:auth')

const headerUserId = 'x-authentication'
const headerToken = 'x-authentication-token'
const headerPolicy = 'x-authentication-policy'
const headerJWTPolicy = 'authorization'
const jwtPolicyRE = /^Bearer\s(.+)$/

const hash = input =>
  crypto
    .createHash('sha1')
    .update(input)
    .digest('hex')

const policySetKey = (policy, key) => {
  try {
    policy.set('key', key)
  } catch (err) {
    if (err.type === 'INVALID_KEY') {
      policy.set('key', '/' + key)
    } else {
      throw err
    }
  }
}

export default () =>
  async function (req, res, next) {
    const { amaging } = req
    const { params } = req
    const { headers } = req

    const result403 = () => next(httpError(403, 'Not Authorized !'))

    const cid = amaging.customer.id

    // JWT Policy
    if (headers[headerJWTPolicy]) {
      debug('Start JWT Policy authentification')

      const match = headers[headerJWTPolicy].match(jwtPolicyRE)
      if (!match) {
        debug('403: Policy creation failed')
        return next(httpError(403, 'Invalid authorization header.'))
      }
      const jwt = match[1]

      const accessKey = getAccessKey(jwt)
      if (!accessKey) {
        debug('403: Unable to get accessKey from JWT')
        return next(httpError(403, 'Access key not found in token.'))
      }

      // Retrive secret
      const secret = amaging.customer.access != null ? amaging.customer.access[accessKey] : undefined
      if (!secret) {
        debug('403: unkown access key')
        return next(httpError(403, 'Access key is invalid.'))
      }

      const policy = await parse(secret, jwt)
      if (!policy) {
        debug('403: invalid JWT')
        return next(httpError(403, 'Token is invalid or expired.'))
      }

      amaging.policy = policy

      policySetKey(policy, params.file)

      amaging.auth.headers.forEach(header => {
        policy.set(header, req.headers[header])
      })

      return next()

    // # Policy
    } else if (headers[headerPolicy]) {
      debug('Start Policy authentification')
      req.app.emit(AUTH_POLICY_LEGACY_USED, headers[headerUserId])

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

      const d = domain.create()

      d.on('error', next)
      return d.run(() =>
        process.nextTick(function () {
          debug('Try to create policy with: ', headers[headerPolicy], headers[headerToken])
          const policy = legacyParse(secret, headers[headerPolicy], headers[headerToken])
          if (!policy) {
            debug('403: Policy creation failed')
            return result403()
          }

          amaging.policy = policy

          policySetKey(policy, params.file)

          amaging.auth.headers.forEach(header => {
            policy.set(header, req.headers[header])
          })

          return next()
        })
      )

    // Traditional authentification
    } else {
      amaging.policy = new Policy({})
      req.app.emit(AUTH_LEGACY_USED, headers[headerUserId])

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
