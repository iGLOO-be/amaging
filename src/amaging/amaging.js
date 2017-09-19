
const {executeStack, cleanAmagingFile} = require('./lib/utils');

const bootstrapper = require('./stack/bootstrapper');
const cidResolver = require('./stack/cid-resolver');
const storageIniter = require('./stack/storage-initer');
const fileIniter = require('./stack/file-initer');
const auth = require('./stack/auth');
const fileDeleter = require('./stack/file-deleter');
const multipartResolver = require('./stack/multipart-resolver');
const cacheResolver = require('./stack/cache-resolver');
const headResolver = require('./stack/head-resolver');
const defaultReader = require('./reader/default-reader');
const imageReader = require('./reader/image-reader');
const defaultWriter = require('./writer/default-writer');
const mutlipartWriter = require('./writer/multipart-writer');

const handler = stack =>
  function(req, res, next) {
    req.params.file = cleanAmagingFile(req.params[0]);
    return executeStack(stack, [req, res], next);
  }
;

module.exports = options =>
  ({
    read: handler([
      bootstrapper(options),
      cidResolver(),
      storageIniter(),
      fileIniter(),
      cacheResolver(),
      imageReader(),
      defaultReader()
    ]),

    write: handler([
      bootstrapper(options),
      cidResolver(),
      multipartResolver(),
      auth(),
      storageIniter(),
      fileIniter(),
      defaultWriter(),
      mutlipartWriter()
    ]),

    delete: handler([
      bootstrapper(options),
      cidResolver(),
      auth(),
      storageIniter(),
      fileIniter(),
      fileDeleter()
    ]),

    head: handler([
      bootstrapper(options),
      cidResolver(),
      storageIniter(),
      fileIniter(),
      headResolver()
    ])
  })
;
