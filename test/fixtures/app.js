/* eslint-env jest */

import path from 'path'
import AWS from 'aws-sdk'
import async from 'async'
import fs from 'fs'
import mime from 'mime'
import extend from 'lodash/extend'
import merge from 'lodash/merge'
import copy from 'copy'
import rimraf from 'rimraf'
import uuid from 'uuid'
import globby from 'globby'

import { getServer } from './utils'
const server = getServer()

const env = process.env.TEST_ENV || 'local'

const storageDir = path.join(__dirname, 'storage')

const mainTestId = uuid()

if (env === 'local') {
  afterAll(done => {
    rimraf(path.join(__dirname, '../..', '.tmp', mainTestId), done)
  })

  module.exports = async function (options) {
    const testID = uuid()
    options = extend({
      customers: {
        test: {
          access: {
            'apiaccess': '4ec2b79b81ee67e305b1eb4329ef2cd1'
          },
          storage: {
            type: 'local',
            options: {
              path: path.join(__dirname, '../..', '.tmp', mainTestId, testID, 'storage')
            }
          },
          cacheStorage: {
            type: 'local',
            options: {
              path: path.join(__dirname, '../..', '.tmp', mainTestId, testID, 'storage_cache')
            }
          }
        }
      }
    }, options)

    const app = server(options)

    await new Promise((resolve, reject) => {
      async.series([
        done => rimraf(options.customers.test.storage.options.path, done),
        done => rimraf(options.customers.test.cacheStorage.options.path, done),
        done => copy(path.join(__dirname, 'storage/**/*'), options.customers.test.storage.options.path, done)
      ], (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    return app
  }
} else if (env === 's3') {
  const isMinio = process.env.MINIO_ENDPOINT && process.env.MINIO_PORT
  const minioConfig = isMinio ? {
    endpoint: process.env.MINIO_ENDPOINT,
    port: process.env.MINIO_PORT,
    style: 'path'
  } : {}

  afterAll(async () => {
    const s3 = new AWS.S3(Object.assign({
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
      params: {
        Bucket: process.env.S3_BUCKET
      }
    }, isMinio && {
      endpoint: `http://${minioConfig.endpoint}:${minioConfig.port}`,
      s3ForcePathStyle: 'true',
      signatureVersion: 'v4'
    }))

    const keys = await s3.listObjects({Prefix: `test_${mainTestId}`}).promise()
    if (keys.Contents.length > 0) {
      await s3.deleteObjects({
        Delete: {
          Objects: keys.Contents.map(k => ({Key: k.Key}))
        }
      }).promise()
    }
  })

  module.exports = async function (options) {
    const testID = uuid()

    options = merge({
      customers: {
        test: {
          access: {
            'apiaccess': '4ec2b79b81ee67e305b1eb4329ef2cd1'
          },
          storage: {
            type: 's3',
            options: Object.assign({
              bucket: process.env.S3_BUCKET,
              path: `test_${mainTestId}/${testID}/storage/main/`,
              key: process.env.S3_ACCESS_KEY,
              secret: process.env.S3_SECRET_KEY
            }, minioConfig)
          },
          cacheStorage: {
            type: 's3',
            options: Object.assign({
              bucket: process.env.S3_BUCKET,
              path: `test_${mainTestId}//${testID}storage/cache/`,
              key: process.env.S3_ACCESS_KEY,
              secret: process.env.S3_SECRET_KEY
            }, minioConfig)
          }
        }
      }
    }, options)

    const app = server(options)

    if (options.__skip_populate) {
      return app
    }

    const s3 = new AWS.S3(Object.assign({
      accessKeyId: options.customers.test.storage.options.key,
      secretAccessKey: options.customers.test.storage.options.secret,
      region: options.customers.test.storage.options.region,
      params: {
        Bucket: options.customers.test.storage.options.bucket
      }
    }, isMinio && {
      endpoint: `http://${options.customers.test.storage.options.endpoint}:${options.customers.test.storage.options.port}`,
      s3ForcePathStyle: 'true',
      signatureVersion: 'v4'
    }))

    const keys = await s3.listObjects({Prefix: options.customers.test.storage.options.path}).promise()
    if (keys.Contents.length > 0) {
      await s3.deleteObjects({
        Delete: {
          Objects: keys.Contents.map(k => ({Key: k.Key}))
        }
      }).promise()
    }

    const files = await globby('**/*', {
      cwd: storageDir,
      onlyFiles: true
    })

    await Promise.all(files.map(file => (
      s3.putObject({
        ContentType: mime.getType(file),
        Body: fs.createReadStream(path.join(storageDir, file)),
        Key: options.customers.test.storage.options.path + file
      }).promise()
    )))

    return app
  }
} else {
  throw new Error('Invalid the test environment variable TEST_ENV. Valids: "local" or "s3".')
}
