
module.exports = (options) ->
  readStack = [
    bootstrapper()
    cidResolver()
    storageIniter()

    defaultReader()
  ]

  writeStack = [
    bootstrapper()
    cidResolver()
    storageIniter()

    auth()
    defaultWriter()
  ]

  read: (req, res, next) ->
    executeStack readStack, [req, res], (err) ->
      return next(err) if err

      # 404
      next()

  write: ->
    executeStack readStack, [req, res], (err) ->
      return next(err) if err

      # 404
      next()

