/* eslint-env jest */

import request from 'supertest'

import appFactory from './fixtures/app'

import chai from 'chai'

const { assert } = chai
const env = process.env.TEST_ENV || 'local'

let Etag, newEtag
let app = null

const cacheControl = 'max-age=0, private'

if (env === 'local') {
  Etag = '"17252"'
  newEtag = '"4667"'
} else {
  Etag = '"1cc596b7a579db797f8aea80bba65415"'
  newEtag = '"ab093153e0081a27fef6b85262189695"'
}

beforeAll(done => { app = appFactory(done) })

/*
        CACHE HTTP
*/
describe('MANAGE HTTP CACHE', () => {
  describe('GET the image', () =>
    test('Should return a 200', async () => {
      const res = await request(app)
        .get('/test/ice.jpg')
        .expect(200)
        .expect('cache-control', cacheControl)
      await assert.equal(res.headers.etag, Etag)
    })
  )

  describe('GET the image and create cache storage', () => {
    test('Should return a 200 OK', async () => {
      const res = await request(app)
        .get('/test/190x180&/ice.jpg')
        .expect(200)
      if (env === 'local') {
        const a = Math.round(parseInt(JSON.parse(res.headers.etag)) / 100)
        const b = Math.round(parseInt(JSON.parse(newEtag)) / 100)
        await assert.equal(a, b)
      } else {
        await assert.equal(res.headers.etag, newEtag)
      }
    })

    // # Via cacheFile
    test('Should return a 304 not modified (190x180)', async () => {
      const res = await request(app)
        .get('/test/190x180&/ice.jpg')
        .expect(200)
      await request(app)
        .get('/test/190x180&/ice.jpg')
        .set('if-none-match', res.headers.etag)
        .expect(304)
    })

    // # Via file
    return test('Should return a 304 not modified (ice.jpg)', async () => {
      await request(app)
        .get('/test/ice.jpg')
        .set('if-none-match', Etag)
        .expect(304)
    })
  })

  // # with different ETag and should return 200
  return describe('GET the image with former Etags', () => {
    test('Should return a 200 OK (ice.jpg)', async () => {
      await request(app)
        .get('/test/ice.jpg')
        .set('if-none-match', newEtag)
        .expect(200)
    })

    // # Via cacheFile
    return test('Should return a 200 OK (190x180)', async () => {
      await request(app)
        .get('/test/190x180&/ice.jpg')
        .set('if-none-match', Etag)
        .expect(200)
    })
  })
})
