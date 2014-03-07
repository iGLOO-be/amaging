
server = require '../../amaging/server'
path = require 'path'

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

app.listen app.get('port'), (err) ->
  throw err if err

  console.log "Server listening #{app.get('port')}"