
import AbstractStorage from './abstract-storage'
import File from '../storage/file'

import path from 'path'
import knox from 'knox'
import AWS from 'aws-sdk'
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
    this._s3 = new AWS.S3({
      accessKeyId: this.options.key,
      secretAccessKey: this.options.secret,
      region: this.options.region,
      // endpoint: `http://${this.options.endpoint}:${this.options.port}`,
      // s3ForcePathStyle: 'true',
      // signatureVersion: 'v4',
      params: {
        Bucket: this.options.bucket
      }
    })
  }

  async readInfo (file) {
    debug('Start reading info for "%s"', file)

    const filePath = this._filepath(file)

    try {
      const res = await this._s3.headObject({
        Key: filePath
      }).promise()

      return {
        isDirectory: false,
        ContentType: res.ContentType,
        ContentLength: parseInt(res.ContentLength),
        ETag: res.ETag,
        LastModified: res.LastModified
      }
    } catch (err) {
      if (err.code === 'Forbidden') {
        throw InvalidResponse('head', { statusCode: 403 })
      } else if (err.code === 'NotFound') {
        // Check if it is a directory
        const res = await this._s3.listObjects({
          Prefix: path.join(filePath, '..') + '/',
          Delimiter: '/'
        }).promise()

        const prefixes = (res && res.CommonPrefixes) || []

        if (prefixes.find(v => v.Prefix === filePath) || prefixes.find(v => v.Prefix === filePath + '/')) {
          return {
            isDirectory: true,
            ContentType: 'application/x-directory',
            ContentLength: 0,
            ETag: null,
            LastModified: null
          }
        } else {
          return
        }
      }
      throw err
    }
  }

  async requestReadStream (file) {
    debug('Create readStream for "%s"', file)
    return this._s3.getObject({ Key: this._filepath(file) }).createReadStream()
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
    return this._s3.deleteObject({
      Key: this._filepath(file)
    }).promise()
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
    const keys = await promisify(this._S3_knox.list).call(this._S3_knox, { prefix: this._filepath(prefix), delimiter: '/' })
    if (keys && keys.Contents && Array.isArray(keys.Contents)) {
      const [files, directories] = await Promise.all([
        Promise.all(keys.Contents.map(file => (
          File.create(
            this,
            null,
            file.Key.replace(this.options.path, '').replace(/\/$/, '')
          )
        ))),
        Promise.all((keys.CommonPrefixes || []).map(file => (
          File.create(
            this,
            null,
            file.Prefix.replace(this.options.path, '').replace(/\/$/, '')
          )
        )))
      ])

      return [...directories, ...files]
    }
    return []
  }

  _filepath (file) {
    return path.join(this.options.path, file)
  }
}

S3Storage.InvalidResponse = InvalidResponse
