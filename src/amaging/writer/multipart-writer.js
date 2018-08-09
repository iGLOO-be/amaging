
import { httpError, fileTypeOrLookup } from '../lib/utils'
import async from 'async'
import formidable from 'formidable'
import fs from 'fs'
import keys from 'lodash/keys'

import debug from 'debug'

const eraseTempFiles = function (files) {
  debug('Erase temp file')
  return async.each(keys(files), (fileKey, done) => fs.unlink(files[fileKey].path, done)
    , function (err) {
      if (err) { throw err }
    })
}

export default () =>
  function (req, res, next) {
    const { amaging } = req

    // Valid headers
    const contentType = req.headers['content-type']

    debug('Start writer with %j',
      {contentType}
    )

    if (!contentType.match(/^multipart\/form-data/)) {
      debug('Abort due to not multipart/form-data')
      return next()
    }

    debug('Start writing file...')

    // # HANDLE MULTIPART

    let stream, files, file

    const form = new formidable.IncomingForm()
    form.keepExtensions = true

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

    return async.series([
      function (done) {
        debug('Keep Refereces')
        // keep references to fields and files
        return form.parse(req, function (err, fields, _files) {
          files = _files
          return done(err)
        })
      },
      function (done) {
        debug('Check file')

        file = files[keys(files)[0]]

        if (!file) {
          debug('Abort due to missing file')
          return done(httpError(403, 'Missing file'))
        }

        if (!file.size) {
          debug('Abort due to missing file size')
          return done(httpError(403, 'Missing file size'))
        }

        file.type = fileTypeOrLookup(file.type, file.name)

        try {
          amaging.policy.set('content-type', file.type)
          amaging.policy.set('content-length', file.size)
        } catch (error) {
          const err = error
          return done(err)
        }

        debug('Request write stream.')

        return amaging.file.requestWriteStream({
          ContentLength: file.size,
          ContentType: file.type
        }
          , function (err, _stream) {
          stream = _stream
          return done(err)
        })
      },
      function (done) {
        debug('Pipe in stream.')
        const readStream = fs.createReadStream(file.path)
        readStream.pipe(stream)
        return readStream.on('end', done)
      },
      function (done) {
        debug('Read info.')
        amaging.file.readInfo(done)
          .then(v => done(null, v))
          .catch(err => done(err))
      }
    ], function (err) {
      eraseTempFiles(files)
      if (err) { return next(err) }

      return res.send({
        success: true,
        file: amaging.file.info
      })
    })
  }
