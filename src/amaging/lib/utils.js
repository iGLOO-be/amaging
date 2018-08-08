
import Boom from 'boom'
import mime from 'mime'

export function executeStack (stack, args, cb) {
  let inc = 0

  var next = function (err) {
    if (err) { return cb(err) }

    const current = stack[inc++]

    if (!current) { return cb() }

    const arg = args.concat([ next ])
    return current.apply(null, arg)
  }

  return next()
}

export function httpError (status, message) {
  return new Boom(message, {statusCode: status})
}

export function cleanAmagingFile (filePath) {
  // Security concerns
  return filePath.replace(/(\.\.\/)+/g, '')
}

export function fileTypeOrLookup (type, file) {
  if (!type || (type === 'application/octet-stream')) {
    return mime.getType(file)
  } else {
    return type
  }
}
