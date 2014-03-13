
{executeStack} = require './lib/utils'

bootstrapper = require './stack/bootstrapper'
cidResolver = require './stack/cid-resolver'
storageIniter = require './stack/storage-initer'
fileIniter = require './stack/file-initer'
auth = require './stack/auth'
fileDeleter = require './stack/file-deleter'

defaultReader = require './reader/default-reader'
imageReader = require './reader/image-reader'
defaultWriter = require './writer/default-writer'

debug = require('debug') 'delete'

module.exports = (options) ->
  readStack = [
    bootstrapper(options)
    cidResolver()
    storageIniter()
    fileIniter()
    imageReader()
    defaultReader()
  ]

  writeStack = [
    bootstrapper(options)
    cidResolver()
    # uploaderHandler()
    (req, res, next) ->
      req.amaging.auth.headers.push('content-type')
      req.amaging.auth.headers.push('content-length')
      next()
    auth()
    storageIniter()
    fileIniter()
    defaultWriter()
  ]

  deleteStack = [
    bootstrapper(options)
    cidResolver()
    auth()
    storageIniter()
    fileIniter()
    fileDeleter()
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

  delete: (req, res, next) ->
    req.params.file = req.params[0]

    executeStack deleteStack, [req, res], (err) ->
      return next(err) if err
      # 404
      next()
