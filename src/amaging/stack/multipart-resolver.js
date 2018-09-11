
export default () =>
  function (req, res, next) {
    const contentType = req.headers['content-type']

    if (!(contentType != null ? contentType.match(/^multipart\/form-data/) : undefined)) {
      req.amaging.auth.headers.push('content-type')
      req.amaging.auth.headers.push('content-length')
    }

    return next()
  }
