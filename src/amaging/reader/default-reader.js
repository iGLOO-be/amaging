
import pEvent from 'p-event'
import Boom from 'boom'

import debugFactory from 'debug'
const debug = debugFactory('amaging:reader:default')

export default () =>
  async function (req, res, next) {
    const { amaging } = req

    debug('Start default reader for file: %j', amaging.file)

    if (!amaging.file.exists()) {
      debug('Stop default reader cause to not found file.')
      throw Boom.notFound()
    }

    if (amaging.file.isDirectory()) {
      debug('Stop default reader cause to file is a directory.')
      throw Boom.notFound()
    }

    debug('File exists!')

    res.set(amaging.file.httpResponseHeaders)

    const stream = await amaging.file.requestReadStream()

    debug('Pipe stream in response.')
    stream.pipe(res)
    debug('Stream piped !')

    try {
      debug('waiting for end of stream')
      await pEvent(stream, 'end')
      debug('stream ended !')
    } catch (err) {
      debug('catch error from stream', err)
      if ((err.code !== 'ENOENT') && (err.code !== 'NotFound') && (err.code !== 'NoSuchKey')) {
        throw err
      }
      throw Boom.notFound()
    }
  }
