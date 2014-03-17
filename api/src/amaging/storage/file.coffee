
AbstractFile = require './abstract-file'

fs = require 'fs'

class File extends AbstractFile
  @create: (storage, cacheStorage, filename, cb) ->
    file = new File(storage, cacheStorage, filename)
    file.readInfo(cb)
    return file

  constructor: (storage, @cacheStorage, filename) ->
    super(storage, filename)

  requestWriteStream: (info, cb) ->
    super info, (err, stream) =>
      return cb err if err

      stream.on 'close', =>
        @deleteCachedFiles (err) ->
          throw err if err

      cb(null, stream)

  deleteFile: (cb) ->
    super (err) =>
      return cb err if err
      @deleteCachedFiles cb

  deleteCachedFiles: (cb) ->
    @cacheStorage.deleteCachedFiles @_filepath(), cb

module.exports = File