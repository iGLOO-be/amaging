
import { httpError, fileTypeOrLookup, findMaxSizeFromPolicy } from '../lib/utils'
import formidable from 'formidable'
import fs from 'fs-extra'
import pEvent from 'p-event'
import Boom from 'boom'

import debug from 'debug'

const eraseTempFiles = async function (files) {
  debug('Erase temp file')
  await Promise.all(
    Object.keys(files).map(fileKey =>
      fs.unlink(files[fileKey].path)
    )
  )
}

export default () =>
  async function (req, res, next) {
    const { amaging } = req

    // Valid headers
    const contentType = req.headers['content-type']
    const maxSize = findMaxSizeFromPolicy(amaging.policy, amaging.options.writer.maxSize)

    debug('Start writer with %j',
      { contentType }
    )

    if (!contentType.match(/^multipart\/form-data/)) {
      debug('Abort due to not multipart/form-data')
      return next()
    }

    debug('Start writing file...')

    // # HANDLE MULTIPART

    const form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.maxFileSize = maxSize

    // Limit handled files to 1
    form.onPart = (function () {
      let fileHandled = 0
      return function (part) {
        if (!part.filename) {
          // Regular text input
          return form.handlePart(part)
        } else if (fileHandled < 1) {
          form.handlePart(part)
        }
        return fileHandled++
      }
    })()

    debug('Parse request')
    let files
    try {
      files = await new Promise((resolve, reject) => {
        form.parse(req, function (err, fields, files) {
          if (err) reject(err)
          else resolve(files)
        })
      })
    } catch (err) {
      if (err.message.match(/maxFileSize exceeded/)) {
        throw Boom.entityTooLarge()
      }
      throw err
    }

    const file = files[Object.keys(files)[0]]

    if (!file) {
      debug('Abort due to missing file')
      throw httpError(403, 'Missing file')
    }

    if (!file.size) {
      debug('Abort due to missing file size')
      throw httpError(403, 'Missing file size')
    }

    file.type = fileTypeOrLookup(file.type, file.name)
    amaging.policy.set('content-type', file.type)
    amaging.policy.set('content-length', file.size)

    debug('Request write stream.')
    const stream = await amaging.file.requestWriteStream({
      ContentLength: file.size,
      ContentType: file.type || 'application/octet-stream'
    })

    debug('Pipe in stream.')
    const readStream = fs.createReadStream(file.path)
    readStream.pipe(stream)
    await pEvent(readStream, 'end')

    debug('Read info of new file and remove cached files')
    await Promise.all([
      amaging.file.readInfo(),
      amaging.cacheStorage.deleteFilesFromPrefix(amaging.file.path),
      eraseTempFiles(files)
    ])

    res.send({
      success: true,
      file: amaging.file.info
    })
  }
