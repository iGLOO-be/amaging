
{httpError} = require '../lib/utils'
debug = require('debug') 'delete'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging

    debug 'Processing to delete the file: %j', amaging.file

    unless amaging.file.exists()
      debug 'The process of deleting the file failed because it was not found.'
      return httpError 404, 'File not found', res

    amaging.file.deleteFile (err) ->
      return next err if err
      res.send
        success: true