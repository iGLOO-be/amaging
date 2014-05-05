
AbstractFile = require './abstract-file'

fs = require 'fs'
async = require 'async'

class File extends AbstractFile
  @create: (storage, cacheStorage, filename, cb) ->
    file = new File(storage, cacheStorage, filename)
    file.readInfo(cb)
    return file

  constructor: (storage, @cacheStorage, filename) ->
    super(storage, filename)

  requestWriteStream: (info, cb) ->
    stream = null

    async.series [
      (done) =>
        super info, (err, _stream) =>
          stream = _stream
          done(err, @) # result @ is to avoid coffeelint alert "no_unnecessary_fat_arrows"
      (done) =>
        @deleteCachedFiles done
    ], (err) ->
      cb err, stream

  deleteFile: (cb) ->
    super (err) =>
      return cb err if err
      @deleteCachedFiles cb

  deleteCachedFiles: (cb) ->
    @cacheStorage.deleteCachedFiles @_filepath(), cb

module.exports = File