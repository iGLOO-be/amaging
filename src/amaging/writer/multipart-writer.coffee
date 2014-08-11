
{httpError} = require '../lib/utils'
async = require 'async'
formidable = require 'formidable'
path = require 'path'
fs = require 'fs'
_ = require 'lodash'

debug = require('debug') 'multipart-writer'

eraseTempFiles = (files) ->
  debug('Erase temp file')
  async.each _.keys(files), (fileKey, done) ->
    fs.unlink(files[fileKey].path, done)
  , (err) ->
    throw err if err

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging

    # Valid headers
    contentType = req.headers['content-type']

    debug('Start writer with %j',
      contentType: contentType
    )

    unless contentType.match /^multipart\/form-data/
      debug('Abort due to not multipart/form-data')
      return next()

    debug('Start writing file...')

    ## HANDLE MULTIPART

    [stream, files, file, fields] = []

    form = new formidable.IncomingForm()
    form.keepExtensions = true

    # Limit handled files to 1
    form.onPart = do ->
      fileHandled = 0
      (part) ->
        unless part.filename
          # Regular text input
          return form.handlePart part
        else if fileHandled < 1
          form.handlePart part
        fileHandled++

    async.series [
      (done) ->
        debug('Keep Refereces')
        # keep references to fields and files
        form.parse req, (err, _fields, _files) ->
          fields = _fields
          files = _files
          done err
      (done) ->
        debug('Check file')

        file = files[_.keys(files)[0]]

        unless file
          debug('Abort due to missing file')
          return httpError 403, 'Missing file', res

        unless file.type
          debug('Abort due to missing content-type')
          return httpError 403, 'Missing content-type', res

        unless file.size
          debug('Abort due to missing file size')
          return httpError 403, 'Missing file size', res

        try
          amaging.policy.set('content-type', file.type)
          amaging.policy.set('content-length', file.size)
        catch err
          return done err

        debug('Request write stream.')

        amaging.file.requestWriteStream
          ContentLength: file.size
          ContentType: file.type
        , (err, _stream) ->
          stream = _stream
          done err
      (done) ->
        debug('Pipe in stream.')
        readStream = fs.createReadStream(file.path)
        readStream.pipe stream
        readStream.on 'end', done
      (done) ->
        debug('Read info.')
        amaging.file.readInfo done
    ], (err) ->
      eraseTempFiles(files)
      return next err if err

      res.send
        success: true
        file: amaging.file.info
