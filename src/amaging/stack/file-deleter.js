
import { httpError } from '../lib/utils'
import debugFactory from 'debug'
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

    await amaging.file.deleteFile()

    res.send({
      success: true
    })
  }
