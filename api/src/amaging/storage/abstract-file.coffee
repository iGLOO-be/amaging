
mime = require 'mime'

optionsRegex = /^(.*)&\//
optionsSep = '&'

class AbstractFile
  constructor: (@storage, filename) ->
    match = filename.match optionsRegex

    if match
      @options = match[1].split(optionsSep)
      @filename = filename.replace optionsRegex, ''
    else
      @options = []
      @filename = filename

  readInfo: (cb) ->
    @storage.readInfo @_filepath(), (err, info) =>
      return cb(err) if err

      @info = info

      cb()

  contentType: ->
    @info?.ContentType or mime.lookup(@filename)

  exists: ->
    @info and typeof @info == 'object'

  createReadStream: ->
    @storage.createReadStream @_filepath()

  requestWriteStream: (info, cb) ->
    @storage.requestWriteStream @_filepath(), info, cb

  deleteFile: (cb) ->
    @storage.deleteFile @_filepath(), cb

  _filepath: ->
    @filename

module.exports = AbstractFile