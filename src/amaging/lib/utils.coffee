
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


  httpError: (type, message, res) ->
    res.send(type, message)


  cleanAmagingFile: (filePath) ->
    # Security concerns
    filePath.replace(/(\.\.\/)+/g, '')
