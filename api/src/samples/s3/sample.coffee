
server = require '../../amaging/server'
path = require 'path'

app = server(
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
  )

app.listen app.get('port'), (err) ->
  throw err if err

  console.log "Server listening #{app.get('port')}"