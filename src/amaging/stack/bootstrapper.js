
import merge from 'lodash/merge'
import { parse as bytesParse } from 'bytes'

export default options =>
  function (req, res, next) {
    const amaging = (req.amaging = (res.amaging = {}))

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
      {headers: []}

    return next()
  }
