
import { httpError } from '../lib/utils'

import debugFactory from 'debug'
const debug = debugFactory('amaging:head-resolver')

export default () =>
  function (req, res, next) {
    const { amaging } = req

    debug('Start head-resolver for file: %j', amaging.file)

    if (!amaging.file.exists()) {
      debug('file not found')
      return next(httpError(404, 'File not found'))
    } else {
      debug('file found')
      res.setHeader('Connection', 'close')
      res.writeHead(200, {
        'Content-Length': amaging.file.info['ContentLength'],
        'Content-Type': amaging.file.contentType(),
        'ETag': amaging.file.info['ETag'],
        'Last-Modified': amaging.file.info['LastModified']
      })
      return res.end()
    }
  }
