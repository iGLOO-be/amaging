
import debugFactory from 'debug'
import auth from './auth'
import { executeMiddleware } from '../lib/utils'
import Boom from 'boom'
const debug = debugFactory('amaging:list-resolver')

export default () =>
  async function (req, res, next) {
    const { amaging } = req
    const { params } = req
    const prefix = params.file || '/'

    debug('Start list-resolver for file: %j', prefix)

    if (!prefix.match(/\/$/)) {
      return next()
    }

    // Apply auth stack
    await executeMiddleware(auth(), req, res)

    // Set `action` to policy for allow action restriction
    amaging.policy.set('action', 'list')

    if (!amaging.file.isDirectory()) {
      throw Boom.notFound('Directory not found.')
    }

    debug('Start getting list from storage', prefix)
    const files = await amaging.storage.list(prefix)
    res.send(files)
  }
