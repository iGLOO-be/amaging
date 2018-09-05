
import merge from 'lodash/merge'

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
        maxSize: 200 * 1024 * 1024 // 200MB
      }
    }, amaging.options)

    amaging.auth =
      {headers: []}

    return next()
  }
