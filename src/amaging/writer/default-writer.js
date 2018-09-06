
import { httpError } from '../lib/utils'
import pEvent from 'p-event'

import debugFactory from 'debug'
const debug = debugFactory('amaging:writer:default')

export default () =>
  async function (req, res, next) {
    const { amaging } = req

    // Valid headers
    const contentLength = req.headers['content-length']
    const contentType = req.headers['content-type'] || 'application/octet-stream'

    debug('Start default writer with %j', {
      contentLength,
      contentType
    })

    // Set `action` to policy for allow action restriction
    amaging.policy.set('action',
      amaging.file.exists()
        ? 'update'
        : 'create'
    )

    if (amaging.file.filename.match(/\/$/)) {
      debug('Start directory creation')

      if (!amaging.file.exists()) {
        debug('file not exist, creating a directory')
        await amaging.file.createAsDirectory()
        debug('end creating directory')
      }

      res.send({
        success: true,
        file: amaging.file
      })

      return
    }

    if (!contentLength) {
      debug('Abort default writer due to missing headers')
      return next(httpError(403, 'Missing header(s)'))
    }

    if (contentType.match(/^multipart\/form-data/)) {
      return next()
    }

    debug('Start writing file...')
    const stream = await amaging.file.requestWriteStream({
      ContentLength: contentLength,
      ContentType: contentType
    })

    debug('Got a write stream, lets pipe')
    req.pipe(stream)
    await pEvent(stream, 'close')

    debug('Read info of new file and remove cached files')
    await Promise.all([
      amaging.file.readInfo(),
      amaging.cacheStorage.deleteFilesFromPrefix(amaging.file.path)
    ])

    debug('End default writer.')

    res.send({
      success: true,
      file: amaging.file
    })
  }
