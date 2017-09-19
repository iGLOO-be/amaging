
module.exports = () =>
  function(req, res, next) {
    // if not multipart
    const contentType = req.headers['content-type'];

    if (!(contentType != null ? contentType.match(/^multipart\/form-data/) : undefined)) {
      req.amaging.auth.headers.push('content-type');
      req.amaging.auth.headers.push('content-length');
    }

    return next();
  }
;
