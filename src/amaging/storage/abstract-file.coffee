
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

  contentLength: ->
    @info?.ContentLength

  contentType: ->
    @info?.ContentType or mime.lookup(@filename)

  eTag: ->
    @info?.ETag

  lastModified: ->
    @info?.LastModified

  exists: ->
    @info and typeof @info == 'object'

  requestReadStream: (cb) ->
    @storage.requestReadStream @_filepath(), cb

  requestWriteStream: (info, cb) ->
    @storage.requestWriteStream @_filepath(), info, cb

  deleteFile: (cb) ->
    @storage.deleteFile @_filepath(), cb

  _filepath: ->
    @filename

module.exports = AbstractFile
