
const Boom = require('boom')
const mime = require('mime')

module.exports = {
  executeStack (stack, args, cb) {
    let inc = 0

    var next = function (err) {
      if (err) { return cb(err) }

      const current = stack[inc++]

      if (!current) { return cb() }

      const arg = args.concat([ next ])
      return current.apply(null, arg)
    }

    return next()
  },

  httpError (status, message) {
    return Boom.create(status, message)
  },

  cleanAmagingFile (filePath) {
    // Security concerns
    return filePath.replace(/(\.\.\/)+/g, '')
  },

  fileTypeOrLookup (type, file) {
    if (!type || (type === 'application/octet-stream')) {
      return mime.lookup(file)
    } else {
      return type
    }
  }
}
