
AbstractStorage = require './abstract-storage'
path = require 'path'
fs = require 'fs'
mime = require 'mime'
mkdirp = require 'mkdirp'
_ = require 'lodash'
mkdirp = require 'mkdirp'

class LocalStorage extends AbstractStorage
  constructor: (options) ->
    @options = _.extend
      path: '/'
    , options

  readInfo: (file, cb) ->
    fs.stat @_filepath(file), (err, stat) ->
      if err and err.code != 'ENOENT'
        return cb(err)

      unless stat
        return cb()

      cb null,
        ContentLength: stat.size
        ContentType: mime.lookup(file)
        ETag: '"' + stat.size + '"'
        LastModified: stat.mtime

  createReadStream: (file) ->
    fs.createReadStream @_filepath(file)

  requestWriteStream: (file, info, cb) ->
    mkdirp path.dirname(@_filepath(file)), (err) =>
      return cb err if err
      cb null, @createWriteStream(file)

  createWriteStream: (file) ->
    fs.createWriteStream @_filepath(file)

  # Privates

  _filepath: (file) ->
    path.join(@options.path, file)

module.exports = LocalStorage
