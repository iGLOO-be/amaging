
import AbstractStorage from './abstract-storage'
import File from '../storage/file'

import path from 'path'
import knox from 'knox'
import Boom from 'boom'
import { promisify } from 'util'
import debugFactory from 'debug'
const debug = debugFactory('amaging:storage:s3')

const InvalidResponse = (method, response) =>
  new Boom(`Invalid ${method.toUpperCase()} response from S3. (Status: ${response.statusCode})`, { statusCode: 500, data: { response } })

export default class S3Storage extends AbstractStorage {
  constructor (options) {
    super()
    this.options = options
    this._S3_knox = new knox.createClient({ // eslint-disable-line new-cap
      port: this.options.port,
      endpoint: this.options.endpoint,
      style: this.options.style,
      key: this.options.key,
      secret: this.options.secret,
      region: this.options.region,
      bucket: this.options.bucket
    })
  }

  async readInfo (file) {
    debug('Start reading info for "%s"', file)

    const res = await promisify(this._S3_knox.headFile).call(this._S3_knox, this._filepath(file))

    if (res.statusCode === 404) return
    if (res.statusCode !== 200) throw InvalidResponse('head', res)

    return {
      isDirectory: res.headers['content-type'] === 'application/x-directory',
      ContentType: res.headers['content-type'],
      ContentLength: res.headers['content-length'],
      ETag: res.headers['etag'],
      LastModified: res.headers['last-modified']
    }
  }

  async requestReadStream (file) {
    debug('Create readStream for "%s"', file)
    return promisify(this._S3_knox.getFile).call(this._S3_knox, this._filepath(file))
  }

  async requestWriteStream (file, info) {
    this._validWriteInfo(info)

    const headers = {
      'content-type': info.ContentType,
      'content-length': info.ContentLength
    }

    const stream = this._S3_knox.put(this._filepath(file), headers)

    stream.on('response', function (res) {
      if (res.statusCode !== 200) {
        return stream.emit('error', InvalidResponse('put', res))
      }
    })

    return stream
  }

  async deleteFile (file) {
    return promisify(this._S3_knox.deleteFile).call(this._S3_knox, this._filepath(file))
  }

  async deleteFilesFromPrefix (file) {
    debug('Begin listing keys')
    const keys = await promisify(this._S3_knox.list).call(this._S3_knox, { prefix: this._filepath(file) })

    debug('Proceed to delete')
    if (keys && keys.Contents && Array.isArray(keys.Contents)) {
      await promisify(this._S3_knox.deleteMultiple).call(this._S3_knox, keys.Contents.map(k => k.Key))
    }
  }

  async list (prefix) {
    const keys = await promisify(this._S3_knox.list).call(this._S3_knox, { prefix: this._filepath(prefix) })
    if (keys && keys.Contents && Array.isArray(keys.Contents)) {
      console.log(keys)
      return Promise.all(keys.Contents.map(file => (
        File.create(
          this,
          null,
          file.Key.replace(this.options.path, '')
        )
      )))
    }
    return []
  }

  _filepath (file) {
    return path.join(this.options.path, file)
  }
}

S3Storage.InvalidResponse = InvalidResponse
