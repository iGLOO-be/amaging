
const path = require('path')
const AWS = require('aws-sdk')
const async = require('async')
const fs = require('fs')
const mime = require('mime')
const _ = require('lodash')
const copy = require('copy')
const rimraf = require('rimraf')

const {getServer} = require('./utils')
const server = getServer()

const env = process.env.TEST_ENV

const storageDir = path.join(__dirname, 'storage')

if (env === 'local') {
  module.exports = function (options, done) {
    if (!done) { done = options }
    options = _.extend({
      customers: {
        test: {
          access: {
            'apiaccess': '4ec2b79b81ee67e305b1eb4329ef2cd1'
          },
          storage: {
            type: 'local',
            options: {
              path: path.join(__dirname, '../../..', '.tmp', 'storage')
            }
          },
          cacheStorage: {
            type: 'local',
            options: {
              path: path.join(__dirname, '../../..', '.tmp', 'storage_cache')
            }
          }
        }
      }
    }
      , options)

    const app = server(options)

    async.series([
      done => rimraf(options.customers.test.storage.options.path, done),
      done => rimraf(options.customers.test.cacheStorage.options.path, done),
      done => copy(path.join(__dirname, 'storage/**/*'), options.customers.test.storage.options.path, done)
    ], done)

    return app
  }
} else if (env === 's3') {
  module.exports = function (options, done) {
    if (!done) { done = options }
    options = _.merge({
      customers: {
        test: {
          access: {
            'apiaccess': '4ec2b79b81ee67e305b1eb4329ef2cd1'
          },
          storage: {
            type: 's3',
            options: {
              endpoint: '127.0.0.1',
              port: 9000,
              style: 'path',

              bucket: process.env.MINIO_BUCKET,
              path: 'storage/main/',
              key: process.env.MINIO_ACCESS_KEY,
              secret: process.env.MINIO_SECRET_KEY
            }
          },
          cacheStorage: {
            type: 's3',
            options: {
              endpoint: '127.0.0.1',
              port: 9000,
              style: 'path',

              bucket: process.env.MINIO_BUCKET,
              path: 'storage/cache/',
              key: process.env.MINIO_ACCESS_KEY,
              secret: process.env.MINIO_SECRET_KEY
            }
          }
        }
      }
    }
      , options)

    const app = server(options)

    if (options.__skip_populate) {
      done()
      return app
    }

    const s3 = new AWS.S3({
      accessKeyId: options.customers.test.storage.options.key,
      secretAccessKey: options.customers.test.storage.options.secret,
      region: options.customers.test.storage.options.region,
      endpoint: `http://${options.customers.test.storage.options.endpoint}:${options.customers.test.storage.options.port}`,
      s3ForcePathStyle: 'true',
      signatureVersion: 'v4',
      params: {
        Bucket: options.customers.test.storage.options.bucket
      }
    })

    let keys = null
    async.series([
      done =>
        s3.listObjects(
          {Prefix: options.customers.test.storage.options.path}
          , function (err, _keys) {
            keys = _keys
            return done(err)
          }),
      function (done) {
        if (!__guard__(keys != null ? keys.Contents : undefined, x => x.length)) {
          return done()
        }
        return s3.deleteObjects({
          Delete: {
            Objects: (keys != null ? keys.Contents.map(k => ({Key: k.Key})) : undefined)
          }
        }
          , done)
      },
      function (done) {
        const files = fs.readdirSync(storageDir)
        return async.each(files, (file, done) =>
          s3.putObject({
            ContentType: mime.lookup(file),
            Body: fs.createReadStream(path.join(storageDir, file)),
            Key: options.customers.test.storage.options.path + file
          }
            , done)

          , done)
      }
    ], done)

    return app
  }
} else {
  throw new Error('Invalid the test environment variable TEST_ENV. Valids: "local" or "s3".')
}

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
}
