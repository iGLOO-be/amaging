
{httpError} = require '../lib/utils'
File = require '../storage/file'

module.exports = ->
  (req, res, next) ->
    amaging = req.amaging
    params = req.params

    console.log params

    unless params.file
      return httpError 404, 'File not found', res

    amaging.file = File.create amaging.storage, params.file, next
