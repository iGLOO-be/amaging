
File = require './file'

class CacheFile extends File
  @create: (storage, filename, cb) ->
    file = new CacheFile(storage, filename)
    file.readInfo(cb)
    return file

  constructor: ->
    super
    @filename = @options.join('_') + '_' + @filename

module.exports = CacheFile
