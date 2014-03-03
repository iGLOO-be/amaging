
server = require './server'

app = server
  uids:
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
        # type: 'local'
        # options:
        #   path: '/rcbe/amaging/cache'

app.listen app.get('port'), (err) ->
  throw err if err

  console.log "Server listening #{app.get('port')}"