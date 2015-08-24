
path = require 'path'
AWS = require 'aws-sdk'
async = require 'async'
fs = require 'fs'
mime = require 'mime'
_ = require 'lodash'

{getServer} = require './utils'
server = getServer()

env = process.env.TEST_ENV

storageDir = path.join(__dirname, 'storage')

if env is 'local'
  module.exports = (options, done) ->
    done = options unless done
    options = _.extend
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
    , options

    app = server(options)

    process.nextTick(done)
    return app

else if env is 's3'
  module.exports = (options, done) ->
    done = options unless done
    options = _.merge
      customers:
        test:
          access:
            'apiaccess': '4ec2b79b81ee67e305b1eb4329ef2cd1'
          storage:
            type: 's3'
            options:
              bucket: 'igloo-amaging-testbucket'
              path: 'storage/main/'
              key: 'AKIAIHK2HP6ME7U3Y3TA'
              secret: '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'
              region: 'eu-west-1'
          cacheStorage:
            type: 's3'
            options:
              bucket: 'igloo-amaging-testbucket'
              path: 'storage/cache/'
              key: 'AKIAIHK2HP6ME7U3Y3TA'
              secret: '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'
              region: 'eu-west-1'
    , options

    app = server(options)

    if options.__skip_populate
      done()
      return app

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
