
import debugFactory from 'debug'
const debug = debugFactory('amaging:cache-resolver')

const doneCacheWith = function (res, file, headers, next) {
  if (!file) {
    debug('No file')
    return next()
  } else {
    debug('Compare file headers ETag')
    const { info } = file

    debug('info: ', info)
    debug('headers: ', headers)

    if (!(info != null ? info['ETag'] : undefined)) {
      return next()
    } else {
      debug(headers['if-none-match'] + ' // ' + info['ETag'])
      if (headers['if-none-match'] !== info['ETag']) {
        return next()
      } else {
        res.set(file.httpResponseHeaders)
        res.status(304, 'Not Modified')
        return res.send('')
      }
    }
  }
}

export default () =>
  function (req, res, next) {
    const { amaging } = req
    const { headers } = req

    if (amaging.file.options.length === 0) {
      debug('AMAGING FILE')
      return doneCacheWith(res, amaging.file, headers, next)
    } else {
      debug('AMAGING CACHE FILE')
      return doneCacheWith(res, amaging.cacheFile, headers, next)
    }
  }
