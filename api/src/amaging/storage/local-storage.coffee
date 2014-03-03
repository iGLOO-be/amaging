
AbstractStorage = require './abstract-storage'
path = require 'path'
fs = require 'fs'
mime = require 'mime'
_ = require 'lodash'

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
    fs.createReadStream(@_filepath(file))


  # Privates

  _filepath: (file) ->
    path.join(@options.path, file)

module.exports = LocalStorage
