
optionsRegex = /^(.*)&\//
optionsSep = '&'

class File
  @create: (storage, filename, cb) ->

    console.log arguments

    file = new File(storage, filename)
    file.readInfo(cb)
    return file

  constructor: (@storage, filename) ->
    match = filename.match optionsRegex

    console.log @

    if match
      @options = match[0].split(optionsSep)
      @filename = filename.replace optionsRegex, ''
    else
      @options = []
      @filename = filename

    console.log @

  readInfo: (cb) ->
    @storage.readInfo @filename, (err, info) =>
      return cb(err) if err

      @info = info

      cb()

  exists: ->
    typeof @info == 'object'

  createReadStream: ->
    @storage.createReadStream @filename

module.exports = File
