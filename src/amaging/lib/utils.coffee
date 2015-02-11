
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


  httpError: (status, message, res) ->
    res.status status
    res.format
      'text/plain': -> res.send message
      'text/html': -> res.send message
      'application/json': -> res.send success: false, message: message


  cleanAmagingFile: (filePath) ->
    # Security concerns
    filePath.replace(/(\.\.\/)+/g, '')
