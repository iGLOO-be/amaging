
require('longjohn')

const server = require('../../amaging/server')

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
          key: 'AKIAIHK2HP6ME7U3Y3TA',
          secret: '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',
          region: 'eu-west-1'
        }
      },
      cacheStorage: {
        type: 's3',
        options: {
          bucket: 'igloo-amaging-testbucket',
          path: 'storage/cache/',
          key: 'AKIAIHK2HP6ME7U3Y3TA',
          secret: '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',
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
