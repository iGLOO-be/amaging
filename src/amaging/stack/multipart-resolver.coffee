
module.exports = ->
  (req, res, next) ->
    # if not multipart
    contentType = req.headers['content-type']

    unless contentType?.match /^multipart\/form-data/
      req.amaging.auth.headers.push('content-type')
      req.amaging.auth.headers.push('content-length')

    next()
