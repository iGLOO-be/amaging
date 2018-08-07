
const server = require('../../lib/amaging/server')
const path = require('path')

const app = server({
  customers: {
    test: {
      access: {
        'apiaccess': '4ec2b79b81ee67e305b1eb4329ef2cd1'
      },
      storage: {
        type: 'local',
        options: {
          path: path.join(__dirname, 'storage')
        }
      },
      cacheStorage: {
        type: 'local',
        options: {
          path: path.join(__dirname, 'storage_cache')
        }
      }
    }
  }
})

app.listen(app.get('port'), function (err) {
  if (err) { throw err }

  return console.log(`Server listening ${app.get('port')}`)
})
