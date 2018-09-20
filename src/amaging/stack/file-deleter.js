
import { httpError } from '../lib/utils'
import debugFactory from 'debug'
import Boom from 'boom'
const debug = debugFactory('amaging:delete')

export default () =>
  async function (req, res, next) {
    const { amaging } = req

    debug('Processing to delete the file: %j', amaging.file)

    // Set `action` to policy for allow action restriction
    amaging.policy.set('action', 'delete')

    if (!amaging.file.exists()) {
      debug('The process of deleting the file failed because it was not found.')
      return next(httpError(404, 'File not found'))
    }

    if (amaging.file.isDirectory()) {
      throw Boom.badRequest('Directories could not deleted.')
    }

    await Promise.all([
      amaging.file.deleteFile(),
      amaging.cacheStorage.deleteFilesFromPrefix(amaging.file.path)
    ])

    res.send({
      success: true
    })
  }
