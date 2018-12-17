
import { findMaxSizeFromPolicy } from '../lib/utils'
import pEvent from 'p-event'
import Boom from 'boom'
import { Transform } from 'stream'

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
    const maxSize = findMaxSizeFromPolicy(amaging.policy, amaging.options.writer.maxSize)

    debug('Start default writer with %j', {
      contentLength,
      contentType
    })

    // Set `action` to policy for allow action restriction
    amaging.policy.set('action', action)

    if (amaging.file.filename.match(/\/$/)) {
      debug('Start directory creation')

      if (amaging.file.exists() || amaging.file.isDirectory()) {
        throw Boom.badRequest('File already exists with the same name.')
      }

      await amaging.file.createAsDirectory()

      res.send({
        success: true,
        file: amaging.file
      })

      return
    }

    if (amaging.file.exists() && amaging.file.isDirectory()) {
      throw Boom.badRequest('A directory exists with the same name.')
    }

    if (!contentLength) {
      debug('Abort default writer due to missing headers')
      throw Boom.forbidden('Missing header(s)')
    }

    if (contentType.match(/^multipart\/form-data/)) {
      return next()
    }

    amaging.policy.set('content-type', contentType)
    amaging.policy.set('content-length', contentLength)

    debug('Start writing file...')
    const writableStream = await amaging.file.requestWriteStream({
      ContentLength: contentLength,
      ContentType: contentType
    })

    debug('Got a write stream, lets pipe')
    const meterStream = req
      .pipe(new Meter(maxSize))
    meterStream.on('error', (err) => {
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
    this.maxBytes = maxBytes || Number.MAX_VALUE
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
