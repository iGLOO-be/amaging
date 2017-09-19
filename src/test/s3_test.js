
const chai = require('chai')
chai.should()

const request = require('supertest')

const {requestFileToken} = require('./fixtures/utils')
const appFactory = require('./fixtures/app')
let app = null

if (process.env.TEST_ENV !== 's3') {
  describe.skip('S3 Storage', S3StorageTest)
} else {
  describe('S3 Storage', S3StorageTest)
}

function S3StorageTest () {
  /*
          INVALID CREDENTIALS
  */
  describe('Invalid Credentials', function () {
    before(done => {
      app = appFactory({
        __skip_populate: true,
        customers: {
          test: {
            storage: {
              options: {
                secret: 'false'
              }
            },
            cacheStorage: {
              options: {
                secret: 'false'
              }
            }
          }
        }
      }
        , done)
    })

    it('Get file should return a 500', () =>
      request(app)
        .get('/test/igloo.jpg')
        .expect(500, 'Invalid HEAD response from S3. (Status: 403)')
    )

    it('Head file should return a 500', () =>
      request(app)
        .head('/test/igloo.jpg')
        .expect(500)
    )

    return it('Put file should return a 500', function () {
      const tok = requestFileToken('expected/igloo.jpg', 'igloo.jpg', 'image/jpeg')
      return request(app)
        .post('/test/igloo.jpg')
        .type(tok.contentType)
        .set('Content-Length', tok.length)
        .set('x-authentication', tok.access)
        .set('x-authentication-token', tok.token)
        .send(tok.buffer)
        .expect(500, 'Invalid HEAD response from S3. (Status: 403)')
    })
  })
}
