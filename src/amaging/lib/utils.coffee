
Boom = require 'boom'
mime = require 'mime'

module.exports =
  executeStack: (stack, args, cb) ->
    inc = 0

    next = (err) ->
      return cb err if err

      current = stack[inc++]

      return cb() unless current

      arg = args.concat([ next ])
      current.apply(null, arg)

    next()


  httpError: (status, message) ->
    Boom.create status, message

  cleanAmagingFile: (filePath) ->
    # Security concerns
    filePath.replace(/(\.\.\/)+/g, '')

  fileTypeOrLookup: (type, file) ->
    if !type || type == 'application/octet-stream'
      return mime.lookup(file)
    else
      return type
