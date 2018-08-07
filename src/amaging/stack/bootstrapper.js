
import _ from 'lodash'

export default options =>
  function (req, res, next) {
    const amaging = (req.amaging = (res.amaging = {}))

    // TODO: do copy of options
    amaging.options = options

    // Default options
    amaging.options = _.merge({
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
