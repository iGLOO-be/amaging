
import { httpError } from '../lib/utils'
import pEvent from 'p-event'

import debugFactory from 'debug'
const debug = debugFactory('amaging:writer:default')

export default () =>
  async function (req, res, next) {
    const { amaging } = req

    // Valid headers
    const contentLength = req.headers['content-length']
    const contentType = req.headers['content-type']

    debug('Start default writer with %j', {
      contentLength,
      contentType
    }
    )

    // Set `action` to policy for allow action restriction
    amaging.policy.set('action',
      amaging.file.exists()
        ? 'update'
        : 'create'
    )

    if (contentType.match(/^multipart\/form-data/)) {
      return next()
    }

    if (!contentLength || !contentType) {
      debug('Abort default writer due to missing headers')
      return next(httpError(403, 'Missing header(s)'))
    }

    debug('Start writing file...')
    const stream = await amaging.file.requestWriteStream({
      ContentLength: contentLength,
      ContentType: contentType
    })

    debug('Got a write stream, lets pipe')
    req.pipe(stream)
    await pEvent(stream, 'close')

    debug('Write done! Start read info')
    await amaging.file.readInfo()

    debug('End default writer.')

    res.send({
      success: true,
      file: amaging.file.info
    })
  }
