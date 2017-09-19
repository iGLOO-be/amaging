
let Etag, newEtag
const chai = require('chai')
const { assert } = chai

const request = require('supertest')
const appFactory = require('./fixtures/app')

const env = process.env.TEST_ENV
let app = null
const cacheControl = 'max-age=0, private'

if (env === 'local') {
  Etag = '"17252"'
  newEtag = '"4667"'
} else {
  Etag = '"1cc596b7a579db797f8aea80bba65415"'
  newEtag = '"87e765c919874876f1f23f95541522f4"'
}

before(done => { app = appFactory(done) })

/*
        CACHE HTTP
*/
describe('MANAGE HTTP CACHE', function () {
  describe('GET the image', () =>
    it('Should return a 200', function (done) {
      request(app)
        .get('/test/ice.jpg')
        .expect(200)
        .end(function (err, res) {
          if (err) { return done(err) }
          assert.equal(res.headers.etag, Etag)
          assert.equal(res.headers['cache-control'], cacheControl)
          return done()
        })
    })
  )

  describe('GET the image and create cache storage', function () {
    it('Should return a 200 OK', function (done) {
      request(app)
        .get('/test/190x180&/ice.jpg')
        .expect(200)
        .end(function (err, res) {
          if (err) { return done(err) }

          if (env === 'local') {
            const a = Math.round(parseInt(JSON.parse(res.headers.etag)) / 100)
            const b = Math.round(parseInt(JSON.parse(newEtag)) / 100)
            assert.equal(a, b)
          } else {
            assert.equal(res.headers.etag, newEtag)
          }

          return done()
        })
    })

    // # Via cacheFile
    it('Should return a 304 not modified (190x180)', function (done) {
      request(app)
        .get('/test/190x180&/ice.jpg')
        .expect(200)
        .end(function (err, res) {
          if (err) { return done(err) }
          return request(app)
            .get('/test/190x180&/ice.jpg')
            .set('if-none-match', res.headers.etag)
            .expect(304, function (err) {
              if (err) { return done(err) }
              return done()
            })
        })
    })

    // # Via file
    return it('Should return a 304 not modified (ice.jpg)', function (done) {
      request(app)
        .get('/test/ice.jpg')
        .set('if-none-match', Etag)
        .expect(304, done)
    })
  })

  // # with different ETag and should return 200
  return describe('GET the image with former Etags', function () {
    it('Should return a 200 OK (ice.jpg)', function (done) {
      request(app)
        .get('/test/ice.jpg')
        .set('if-none-match', newEtag)
        .expect(200, done)
    })

    // # Via cacheFile
    return it('Should return a 200 OK (190x180)', function (done) {
      request(app)
        .get('/test/190x180&/ice.jpg')
        .set('if-none-match', Etag)
        .expect(200, done)
    })
  })
})
