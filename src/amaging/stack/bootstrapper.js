
import merge from 'lodash/merge'
import { parse as bytesParse } from 'bytes'
import { cleanAmagingFile } from '../lib/utils'

export default options =>
  function (req, res, next) {
    const amaging = (req.amaging = (res.amaging = {}))

    req.params.file = cleanAmagingFile(req.params[0])

    // TODO: do copy of options
    amaging.options = options

    // Default options
    amaging.options = merge({
      cache: {
        cacheControl: 'private',
        maxAge: 0,
        etag: true
      },
      writer: {
        maxSize: bytesParse('200mb')
      }
    }, amaging.options)

    amaging.options.writer.maxSize = bytesParse(amaging.options.writer.maxSize)

    amaging.auth =
      { headers: [] }

    next()
  }
