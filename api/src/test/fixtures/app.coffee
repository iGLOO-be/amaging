
server = require('../../amaging/server')
path = require 'path'
AWS = require 'aws-sdk'
async = require 'async'
fs = require 'fs'
mime = require 'mime'
env = process.env.TEST_ENV

storageDir = path.join(__dirname, 'storage')

if env is 'local'
  module.exports = (done) ->
    app = server(
      customers:
        test:
          access:
            'apiaccess': '4ec2b79b81ee67e305b1eb4329ef2cd1'
          storage:
            type: 'local'
            options:
              path: path.join(__dirname, 'storage')
          cacheStorage:
            type: 'local'
            options:
              path: path.join(__dirname, 'storage_cache')
    )
    process.nextTick(done)
    return app

else if env is 's3'
  module.exports = (done) ->
    options =
      customers:
        test:
          access:
            'apiaccess': '4ec2b79b81ee67e305b1eb4329ef2cd1'
          storage:
            type: 's3'
            options:
              bucket: 'igloo-s3-test'
              path: 'storage/main/'
              key: 'AKIAJWPY4WSQO7FWJF2A'
              secret: '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'
              region: 'eu-west-1'
          cacheStorage:
            type: 's3'
            options:
              bucket: 'igloo-s3-test'
              path: 'storage/cache/'
              key: 'AKIAJWPY4WSQO7FWJF2A'
              secret: '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'
              region: 'eu-west-1'

    app = server(options)

    s3 = new AWS.S3
      accessKeyId: options.customers.test.storage.options.key
      secretAccessKey: options.customers.test.storage.options.secret
      region: options.customers.test.storage.options.region
      params:
        Bucket: options.customers.test.storage.options.bucket

    keys = null
    async.series [
      (done) ->
        s3.listObjects
          Prefix: options.customers.test.storage.options.path
        , (err, _keys) ->
          keys = _keys
          done err
      (done) ->
        unless keys?.Contents?.length
          return done()
        s3.deleteObjects
          Delete:
            Objects: keys?.Contents.map (k) ->
              Key: k.Key
        , done
      (done) ->
        files = fs.readdirSync(storageDir)
        async.each files, (file, done) ->
          s3.putObject
            ContentType: mime.lookup(file)
            Body: fs.createReadStream(path.join(storageDir, file))
            Key: options.customers.test.storage.options.path + file
          , done
        , done
    ], done

    return app

else
  throw new Error 'Invalid the test environment variable TEST_ENV. Valids: "local" or "s3".'
