
{executeStack, cleanAmagingFile} = require './lib/utils'

bootstrapper = require './stack/bootstrapper'
cidResolver = require './stack/cid-resolver'
storageIniter = require './stack/storage-initer'
fileIniter = require './stack/file-initer'
auth = require './stack/auth'
fileDeleter = require './stack/file-deleter'
multipartResolver = require './stack/multipart-resolver'
cacheResolver = require './stack/cache-resolver'
headResolver = require './stack/head-resolver'
defaultReader = require './reader/default-reader'
imageReader = require './reader/image-reader'
defaultWriter = require './writer/default-writer'
mutlipartWriter = require './writer/multipart-writer'

module.exports = (options) ->
  readStack = [
    bootstrapper(options)
    cidResolver()
    storageIniter()
    fileIniter()
    cacheResolver()
    imageReader()
    defaultReader()
  ]

  writeStack = [
    bootstrapper(options)
    cidResolver()
    multipartResolver()
    auth()
    storageIniter()
    fileIniter()
    defaultWriter()
    mutlipartWriter()
  ]

  deleteStack = [
    bootstrapper(options)
    cidResolver()
    auth()
    storageIniter()
    fileIniter()
    fileDeleter()
  ]

  headStack = [
    bootstrapper(options)
    cidResolver()
    storageIniter()
    fileIniter()
    headResolver()
  ]

  read: (req, res, next) ->
    req.params.file = cleanAmagingFile req.params[0]

    executeStack readStack, [req, res], (err) ->
      return next(err) if err
      # 404
      next()

  write: (req, res, next) ->
    req.params.file = cleanAmagingFile req.params[0]

    executeStack writeStack, [req, res], (err) ->
      return next(err) if err
      # 404
      next()

  delete: (req, res, next) ->
    req.params.file = cleanAmagingFile req.params[0]

    executeStack deleteStack, [req, res], (err) ->
      return next(err) if err
      # 404
      next()

  head: (req, res, next) ->
    req.params.file = cleanAmagingFile req.params[0]

    executeStack headStack, [req, res], (err) ->
      return next(err) if err
      # 404
      next()
