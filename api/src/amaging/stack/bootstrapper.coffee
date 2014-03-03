
module.exports = (options) ->
  (req, res, next) ->
    amaging = req.amaging = res.amaging = {}

    # TODO: do copy of options
    amaging.options = options

    next()
