
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

handler = (stack) ->
  (req, res, next) ->
    req.params.file = cleanAmagingFile req.params[0]
    executeStack stack, [req, res], next

module.exports = (options) ->
  read: handler([
    bootstrapper(options)
    cidResolver()
    storageIniter()
    fileIniter()
    cacheResolver()
    imageReader()
    defaultReader()
  ])

  write: handler([
    bootstrapper(options)
    cidResolver()
    multipartResolver()
    auth()
    storageIniter()
    fileIniter()
    defaultWriter()
    mutlipartWriter()
  ])

  delete: handler([
    bootstrapper(options)
    cidResolver()
    auth()
    storageIniter()
    fileIniter()
    fileDeleter()
  ])

  head: handler([
    bootstrapper(options)
    cidResolver()
    storageIniter()
    fileIniter()
    headResolver()
  ])
