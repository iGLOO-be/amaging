
{httpError} = require '../lib/utils'

GMFilterEngine = require '../../gm-filter/gm-filter'
tmp = require 'tmp'
async = require 'async'
fs = require 'fs'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging
    options = amaging.file.options

    unless options.length
      return next()

    if amaging.cacheFile.exists()
      # really bad no?
      amaging.file = amaging.cacheFile
      return next()

    gmFilter = new GMFilterEngine()
    gmFilter.addOptions options

    unless gmFilter.hasFilters()
      return next()

    tmpFile = null
    writeStream = null

    async.series [
      (done) ->
        tmp.file (err, _tmpFile) ->
          tmpFile = _tmpFile
          done err
      (done) ->
        read = amaging.file.createReadStream()
        write = fs.createWriteStream(tmpFile)
        read.pipe(write)
        read.on('end', done)
      (done) ->
        gmFilter.runOn(tmpFile, done)
      (done) ->
        amaging.cacheFile.requestWriteStream (err, _writeStream) ->
          writeStream = _writeStream
          done err
      (done) ->
        tmpRead = fs.createReadStream(tmpFile)
        tmpRead.pipe(writeStream)
        tmpRead.on 'end', done
      (done) ->
        fs.unlink tmpFile, done
      (done) ->
        amaging.cacheFile.readInfo done
      (done) ->
        # really bad no?
        amaging.file = amaging.cacheFile
        done()
    ], next
