/* eslint-env jest */

import request from 'supertest'

import { requestFileToken } from './fixtures/utils'
import appFactory from './fixtures/app'
import S3Storage from '../src/amaging/storage/s3-storage'
import chai from 'chai'
chai.should()

const { expect } = chai
let app = null

if (process.env.TEST_ENV !== 's3') {
  describe.skip('S3 Storage', () => {})
} else {
  describe('S3 Storage', S3StorageTest)
}

describe('S3 Storage - unit test', () => {
  test('S3Storage.InvalidResponse', () => {
    const err = S3Storage.InvalidResponse('verb', { foo: true, statusCode: 123 })
    expect(err.isBoom).to.equal(true)
    expect(err.message).to.equal('Invalid VERB response from S3. (Status: 123)')
    expect(err.output.statusCode).to.deep.equal(500)
  })
})

function S3StorageTest () {
  /*
          INVALID CREDENTIALS
  */
  describe('Invalid Credentials', () => {
    // TODO: find why this test is not really skipped by jest ...
    beforeAll(done => {
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
      }, done)
    })

    test('Get file should return a 500', () =>
      request(app)
        .get('/test/igloo.jpg')
        .expect(500, 'Invalid HEAD response from S3. (Status: 403)')
    )

    test('Head file should return a 500', () =>
      request(app)
        .head('/test/igloo.jpg')
        .expect(500)
    )

    test('Put file should return a 500', () => {
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
