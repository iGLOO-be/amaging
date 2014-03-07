
server = require('../../amaging/server')
path = require 'path'
env = process.env.TEST_ENV

if env is 'local'
  module.exports = (done) ->
    app = server(
      customers:
        test:
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
    app = server(
      customers:
        test:
          # access:
          #   'partnerportal': 'qsd5q4s65d54qa5z4e6a5z465s4654qsd56qqs4d56a4ze6'
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
            # type: 'local'
            # options:
            #   path: '/rcbe/amaging/cache'
    )
    process.nextTick(done)
    return app

else
  throw new Error 'Invalid the test environment variable TEST_ENV. Valids: "local" or "s3".'
