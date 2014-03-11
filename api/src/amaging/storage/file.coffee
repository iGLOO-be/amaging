
optionsRegex = /^(.*)&\//
optionsSep = '&'

class File
  @create: (storage, filename, cb) ->
    file = new File(storage, filename)
    file.readInfo(cb)
    return file

  constructor: (@storage, filename) ->
    match = filename.match optionsRegex

    if match
      @options = match[1].split(optionsSep)
      @filename = filename.replace optionsRegex, ''
    else
      @options = []
      @filename = filename

  readInfo: (cb) ->
    @storage.readInfo @filename, (err, info) =>
      return cb(err) if err

      @info = info

      cb()

  contentType: ->
    @info?.ContentType

  exists: ->
    @info and typeof @info == 'object'

  createReadStream: ->
    @storage.createReadStream @filename

  requestWriteStream: (info, cb) ->
    @storage.requestWriteStream @filename, info, cb

module.exports = File
