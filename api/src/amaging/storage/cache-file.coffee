
AbstractFile = require './abstract-file'

class CacheFile extends AbstractFile
  @create: (storage, filename, cb) ->
    file = new CacheFile(storage, filename)
    file.readInfo(cb)
    return file

  _filepath: ->
    @filename + '/' + @options.join('_')

module.exports = CacheFile
