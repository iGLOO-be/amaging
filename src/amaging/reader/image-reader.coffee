
{httpError} = require '../lib/utils'

GMFilterEngine = require '../../gm-filter/gm-filter'
tmp = require 'tmp'
async = require 'async'
fs = require 'fs'

debug = require('debug') 'amaging:reader:image'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging
    options = amaging.file.options
    acceptType = [
      'image/jpeg'
      'image/png'
      'image/gif'
      'image/bmp'
      'image/tiff'
      'image/x-jg'
    ]

    debug('Start image reader for file: %j', amaging.file)

    unless amaging.file.exists()
      debug('Stop image reader cause to not found file.')
      return next()

    unless options.length
      return next()

    if amaging.cacheFile.exists()
      debug('Stop image reader cause to cache file exists.')
      # really bad no?
      amaging.file = amaging.cacheFile
      return next()

    unless acceptType.indexOf(amaging.file.contentType()) > -1
      debug('Stop image reader cause the file is not an image')
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
        amaging.file.requestReadStream (err, read) ->
          return done err if err

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
        writeStream.on 'close', () ->
          done()
      (done) ->
        fs.unlink tmpFile, done
      (done) ->
        amaging.cacheFile.readInfo (err) ->
          done err
      (done) ->
        # really bad no?
        amaging.file = amaging.cacheFile
        done()
    ], (err) ->
      next err
