
import Boom from 'boom'
import mime from 'mime'

export function executeStack (stack, args, cb) {
  let inc = 0

  const next = function (err) {
    if (err) { return cb(err) }

    const current = stack[inc++]

    if (!current) { return cb() }

    const arg = args.concat([
      // next
      (...args) => process.nextTick(() => next(...args))
    ])
    try {
      const result = current.apply(null, arg)
      if (result && result.catch) {
        result.catch(err => {
          cb(err)
        })
      }
    } catch (err) {
      cb(err)
    }
  }

  return next()
}

export async function executeMiddleware (fn, ...args) {
  let _err

  await fn(...args, (err) => {
    if (err) {
      _err = err
    }
  })

  if (_err) {
    throw _err
  }
}

export function httpError (status, message, data) {
  return new Boom(message, {statusCode: status, data})
}

export function cleanAmagingFile (filePath) {
  // Security concerns
  return filePath.replace(/(\.\.\/)+/g, '')
}

export function fileTypeOrLookup (type, file) {
  if (!type || (type === 'application/octet-stream')) {
    return mime.getType(file) || 'application/octet-stream'
  } else {
    return type
  }
}
