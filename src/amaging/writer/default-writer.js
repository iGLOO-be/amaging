
import { httpError } from '../lib/utils'
import pEvent from 'p-event'
import Boom from 'boom'
import { Transform } from 'stream'
import { parse as bytesParse } from 'bytes'

import debugFactory from 'debug'
const debug = debugFactory('amaging:writer:default')

export default () =>
  async function (req, res, next) {
    const { amaging } = req

    // Valid headers
    const contentLength = req.headers['content-length']
    const contentType = req.headers['content-type'] || 'application/octet-stream'
    const action = amaging.file.exists()
      ? 'update'
      : 'create'

    debug('Start default writer with %j', {
      contentLength,
      contentType
    })

    // Set `action` to policy for allow action restriction
    amaging.policy.set('action', action)

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
    const writableStream = await amaging.file.requestWriteStream({
      ContentLength: contentLength,
      ContentType: contentType
    })

    debug('Got a write stream, lets pipe')
    const meterStream = req
      .pipe(new Meter(req.amaging.options.writer.maxSize))
    meterStream.on('error', (err) => {
      writableStream.emit('error', err)
      next(err)
    })
    await pEvent(meterStream.pipe(writableStream), 'finish')

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

class Meter extends Transform {
  constructor (maxBytes) {
    super()
    this.bytes = 0
    this.maxBytes = bytesParse(maxBytes) || Number.MAX_VALUE
  }

  _transform (chunk, encoding, cb) {
    this.bytes += chunk.length
    this.push(chunk)
    if (this.bytes > this.maxBytes) {
      return cb(Boom.entityTooLarge())
    }
    cb()
  }
}
