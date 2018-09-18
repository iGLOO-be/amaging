
import asyncHandler from 'express-async-handler'

import bootstrapper from './stack/bootstrapper'
import cidResolver from './stack/cid-resolver'
import storageIniter from './stack/storage-initer'
import fileIniter from './stack/file-initer'
import auth from './stack/auth'
import fileDeleter from './stack/file-deleter'
import multipartResolver from './stack/multipart-resolver'
import cacheResolver from './stack/cache-resolver'
import headResolver from './stack/head-resolver'
import defaultReader from './reader/default-reader'
import imageReader from './reader/image-reader'
import defaultWriter from './writer/default-writer'
import mutlipartWriter from './writer/multipart-writer'
import listResolver from './stack/list-resolver'

const handler = stack => stack.map(asyncHandler)

export default options =>
  ({
    read: handler([
      bootstrapper(options),
      cidResolver(),
      storageIniter(),
      fileIniter(),
      cacheResolver(),
      listResolver(),
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
      cacheResolver(),
      imageReader(),
      headResolver()
    ])
  })
