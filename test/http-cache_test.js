/* eslint-env jest */

import request from 'supertest'

import appFactory from './fixtures/app'

const env = process.env.TEST_ENV || 'local'

let Etag, newEtag

const cacheControl = 'max-age=0, private'

if (env === 'local') {
  Etag = '"17252"'
  newEtag = '"4676"'
} else {
  Etag = '"1cc596b7a579db797f8aea80bba65415"'
  newEtag = '"ab093153e0081a27fef6b85262189695"'
}

/*
        CACHE HTTP
*/
describe('MANAGE HTTP CACHE', () => {
  describe('GET the image', () =>
    test('Should return a 200', async () => {
      const app = await appFactory()
      await request(app)
        .get('/test/ice.jpg')
        .expect(200)
        .expect('cache-control', cacheControl)
        .expect('etag', Etag)
        .expect('content-type', 'image/jpeg')
        .expect('content-length', '17252')
        // .expect('Last-Modified')
    })
  )

  describe('GET the image and create cache storage', () => {
    test('Should return a 200 OK', async () => {
      const app = await appFactory()
      await request(app)
        .get('/test/190x180&/ice.jpg')
        .expect(200)
        .expect('cache-control', cacheControl)
        .expect('etag', newEtag)
        .expect('content-type', 'image/jpeg')
        .expect('content-length', '4676')
    })

    // # Via cacheFile
    test('Should return a 304 not modified (190x180)', async () => {
      const app = await appFactory()
      const res = await request(app)
        .get('/test/190x180&/ice.jpg')
        .expect(200)
      await request(app)
        .get('/test/190x180&/ice.jpg')
        .set('if-none-match', res.headers.etag)
        .expect(304)
        .expect('cache-control', cacheControl)
        .expect('etag', res.headers.etag)
    })

    // # Via file
    test('Should return a 304 not modified (ice.jpg)', async () => {
      const app = await appFactory()
      await request(app)
        .get('/test/ice.jpg')
        .set('if-none-match', Etag)
        .expect(304)
        .expect('cache-control', cacheControl)
        .expect('etag', Etag)
    })
  })

  // # with different ETag and should return 200
  describe('GET the image with former Etags', () => {
    test('Should return a 200 OK (ice.jpg)', async () => {
      const app = await appFactory()
      await request(app)
        .get('/test/ice.jpg')
        .set('if-none-match', newEtag)
        .expect(200)
        .expect('cache-control', cacheControl)
        .expect('etag', Etag)
        .expect('content-type', 'image/jpeg')
        .expect('content-length', '17252')
    })

    // # Via cacheFile
    test('Should return a 200 OK (190x180)', async () => {
      const app = await appFactory()
      await request(app)
        .get('/test/190x180&/ice.jpg')
        .set('if-none-match', Etag)
        .expect(200)
        .expect('cache-control', cacheControl)
        .expect('etag', newEtag)
        .expect('content-type', 'image/jpeg')
        .expect('content-length', '4676')
    })
  })
})
