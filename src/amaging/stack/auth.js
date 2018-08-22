import {httpError} from '../lib/utils'
import crypto from 'crypto'
import domain from 'domain' // eslint-disable-line
import { parse, legacyParse, getAccessKey, Policy } from '@igloo-be/amaging-policy'
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
        return result403()
      }
      const jwt = match[1]

      const accessKey = getAccessKey(jwt)
      if (!accessKey) {
        debug('403: Unable to get accessKey from JWT')
        return result403()
      }

      // Retrive secret
      const secret = amaging.customer.access != null ? amaging.customer.access[accessKey] : undefined
      if (!secret) {
        debug('403: unkown access key')
        return result403()
      }

      const policy = await parse(secret, jwt)

      amaging.policy = policy

      policy.set('key', params.file)

      for (let val = 0; val < amaging.auth.headers.length; val++) {
        const header = amaging.auth.headers[val]
        policy.set(header, val)
      }

      return next()

    // # Policy
    } else if (headers[headerPolicy]) {
      debug('Start Policy authentification')

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
