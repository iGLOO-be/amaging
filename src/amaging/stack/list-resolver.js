
import debugFactory from 'debug'
const debug = debugFactory('amaging:list-resolver')

export default () =>
  async function (req, res, next) {
    const { amaging } = req
    const { params } = req
    const prefix = params.file || '/'

    debug('Start list-resolver for file: %j', prefix)

    if (!prefix.match(/\/$/)) {
      return next()
    }

    debug('Start getting list from storage', params.file)
    const files = await amaging.storage.list(prefix)
    res.send(files)
  }
