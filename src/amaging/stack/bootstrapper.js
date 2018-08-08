
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
      }
    }
      , amaging.options)

    amaging.auth =
      {headers: []}

    return next()
  }
