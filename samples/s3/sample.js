
require('longjohn')

const server = require('../../lib/amaging/server').default

const app = server({
  customers: {
    test: {
      access: {
        'apiaccess': '4ec2b79b81ee67e305b1eb4329ef2cd1'
      },
      storage: {
        type: 's3',
        options: {
          bucket: 'igloo-amaging-testbucket',
          path: 'storage/main/',
          key: process.env.AWS_ACCESS_KEY_ID,
          secret: process.env.AWS_SECRET_ACCESS_KEY,
          region: 'eu-west-1'
        }
      },
      cacheStorage: {
        type: 's3',
        options: {
          bucket: 'igloo-amaging-testbucket',
          path: 'storage/cache/',
          key: process.env.AWS_ACCESS_KEY_ID,
          secret: process.env.AWS_SECRET_ACCESS_KEY,
          region: 'eu-west-1'
        }
      }
    }
  }
})

app.listen(app.get('port'), function (err) {
  if (err) { throw err }

  return console.log(`Server listening ${app.get('port')}`)
})
