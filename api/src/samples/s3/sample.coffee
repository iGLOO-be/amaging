
server = require '../../amaging/server'
path = require 'path'

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

app.listen app.get('port'), (err) ->
  throw err if err

  console.log "Server listening #{app.get('port')}"