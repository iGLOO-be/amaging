
import AbstractStorage from './abstract-storage'
import File from '../storage/file'

import path from 'path'
import AWS from 'aws-sdk'
import Boom from 'boom'
import stream from 'stream'
import debugFactory from 'debug'
const debug = debugFactory('amaging:storage:s3')

const InvalidResponse = (method, response) =>
  new Boom(`Invalid ${method.toUpperCase()} response from S3. (Status: ${response.statusCode})`, { statusCode: 500, data: { response } })

const DIRECTORY_INFO = Object.freeze({
  isDirectory: true,
  ContentType: 'application/x-directory',
  ContentLength: 0,
  ETag: null,
  LastModified: null
})

export default class S3Storage extends AbstractStorage {
  constructor (options, amaging) {
    super(options, amaging)
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
      if (file === '/') {
        const err = new Error('Root directory')
        err.code = 'NotFound'
        throw err
      }

      const res = await this._s3.headObject({
        Key: filePath.replace(/\/$/, '')
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
          return Object.assign({}, DIRECTORY_INFO)
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
    const pass = new stream.PassThrough()

    this._validWriteInfo(info)

    const uploadArg = {
      Key: this._filepath(file),
      Body: pass,
      ContentLength: parseFloat(info.ContentLength),
      ContentType: info.ContentType || 'application/octet-stream'
    }
    this._s3.upload(uploadArg)
      .promise()
      .then(() => {
        pass.emit('close')
      })

    return pass
  }

  async deleteFile (file) {
    return this._s3.deleteObject({
      Key: this._filepath(file)
    }).promise()
  }

  async deleteFilesFromPrefix (file) {
    debug('Begin listing keys')
    const keys = await this._s3.listObjects({
      Prefix: this._filepath(file)
    }).promise()

    debug('Proceed to delete', keys)
    if (keys && keys.Contents && Array.isArray(keys.Contents) && keys.Contents.length > 0) {
      debug('Proceed to deleteObjects', keys.Contents.map(k => ({ Key: k.Key })))
      await this._s3.deleteObjects({
        Delete: {
          Objects: keys.Contents.map(k => ({ Key: k.Key }))
        }
      }).promise()
    }
  }

  async list (prefix) {
    const filePrefix = this._filepath(prefix)

    const keys = await this._s3.listObjects({
      Prefix: filePrefix,
      Delimiter: '/'
    }).promise()

    if (keys && keys.Contents && Array.isArray(keys.Contents)) {
      const contents = keys.Contents
        // In case of directory (as file), it should not list himself
        .filter(file => file.Key !== filePrefix)

      const [files, directories] = await Promise.all([
        Promise.all(contents.map(file => (
          File.create(
            this,
            file.Key.replace(this.options.path, '').replace(/\/$/, '')
          )
        ))),
        Promise.all((keys.CommonPrefixes || []).map(file => (
          File.create(
            this,
            file.Prefix.replace(this.options.path, '').replace(/\/$/, ''),
            Object.assign({}, DIRECTORY_INFO)
          )
        )))
      ])

      return [...directories, ...files]
    }
    return []
  }

  async createAsDirectory (filename) {
    await this._s3.upload({
      Key: this._filepath(filename),
      Body: '',
      ContentType: DIRECTORY_INFO.ContentType,
      ContentLength: DIRECTORY_INFO.ContentLength
    }).promise()
  }

  _filepath (file) {
    return path.join(this.options.path, file)
  }
}

S3Storage.InvalidResponse = InvalidResponse
