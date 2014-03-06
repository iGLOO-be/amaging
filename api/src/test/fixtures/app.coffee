
server = require('../../amaging/server')
path = require 'path'

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
      rcbe:
        access:
          'partnerportal': 'qsd5q4s65d54qa5z4e6a5z465s4654qsd56qqs4d56a4ze6'
        storage:
          type: 's3'
          options:
            bucket: 'bucket-amaging-rcbe'
            path: '/rcbe/amaging/original'
            key: ''
            secret: ''
        cacheStorage:
          type: 's3'
          options:
            bucket: 'bucket-amaging-rcbe'
            path: '/rcbe/amaging/cache'
            key: ''
            secret: ''
          type: 'local'
          options:
            path: '/rcbe/amaging/cache'
  )

  process.nextTick(done)

  return app

