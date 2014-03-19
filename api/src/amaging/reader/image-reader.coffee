
{httpError} = require '../lib/utils'

GMFilterEngine = require '../../gm-filter/gm-filter'
tmp = require 'tmp'
async = require 'async'
fs = require 'fs'

debug = require('debug') 'image-reader'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging
    options = amaging.file.options

    debug('Start image reader for file: %j', amaging.file)

    unless amaging.file.exists()
      debug('Stop image reader cause to not found file.')
      return httpError 404, 'File not found', res

    unless options.length
      return next()

    if amaging.cacheFile.exists()
      debug('Stop image reader cause to cache file exists.')
      # really bad no?
      amaging.file = amaging.cacheFile
      return next()

    gmFilter = new GMFilterEngine()
    gmFilter.addOptions options

    unless gmFilter.hasFilters()
      debug('Stop image reader cause to no filters match.')
      return next()

    tmpFile = null
    writeStream = null
    tmpStats = null

    debug('Begin image transform with filters. %j', gmFilter)

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
        fs.stat tmpFile, (err, stats) ->
          tmpStats = stats
          done err
      (done) ->
        amaging.cacheFile.requestWriteStream
          ContentLength: tmpStats.size
          ContentType: amaging.file.contentType()
        , (err, _writeStream) ->
          writeStream = _writeStream
          done err
      (done) ->
        tmpRead = fs.createReadStream(tmpFile)
        tmpRead.pipe(writeStream)
        writeStream.on 'close', done
      (done) ->
        fs.unlink tmpFile, done
      (done) ->
        amaging.cacheFile.readInfo done
      (done) ->
        # really bad no?
        amaging.file = amaging.cacheFile
        done()
    ], next
