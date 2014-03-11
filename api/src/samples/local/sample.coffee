
server = require '../../amaging/server'
path = require 'path'

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

app.listen app.get('port'), (err) ->
  throw err if err

  console.log "Server listening #{app.get('port')}"