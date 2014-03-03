
{executeStack} = require './lib/utils'

bootstrapper = require './stack/bootstrapper'
cidResolver = require './stack/cid-resolver'
storageIniter = require './stack/storage-initer'
fileIniter = require './stack/file-initer'

defaultReader = require './reader/default-reader'

module.exports = (options) ->
  readStack = [
    bootstrapper(options)
    cidResolver()
    storageIniter()
    fileIniter()

    # imageReader()
    defaultReader()
  ]

  writeStack = [
    # bootstrapper(options)
    # cidResolver()
    # storageIniter()
    # fileIniter()

    # auth()
    # defaultWriter()
  ]

  read: (req, res, next) ->
    req.params.file = req.params[0]

    executeStack readStack, [req, res], (err) ->
      return next(err) if err
      # 404
      next()

  write: (req, res, next) ->
    req.params.file = req.params[0]

    executeStack writeStack, [req, res], (err) ->
      return next(err) if err
      # 404
      next()
