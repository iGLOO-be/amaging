
const request = require('supertest')

const {assertResEqualFile, assertResImageEqualFile} = require('./fixtures/utils')
const appFactory = require('./fixtures/app')
let app = null

before(done => { app = appFactory(done) })

describe('GET : Play with image filters', function () {
  it('Should return a 200 OK by modifying the image', function (done) {
    request(app)
      .get('/test/blur(5,2)&/igloo.jpg')
      .expect(200)
      .end(function (err, res) {
        if (err) { return done(err) }
        assertResImageEqualFile(res, 'expected/blur(5,2)_igloo.jpg', done)
      })
  })

  it('Should return a 200 OK by using an unknown filter', function (done) {
    request(app)
      .get('/test/unknown&/igloo.jpg')
      .expect(200, done)
  })

  return it('Should return 200 OK by using a filter on a non image file', function (done) {
    request(app)
      .get('/test/196&/file.json')
      .expect(200)
      .end(function (err, res) {
        if (err) { return done(err) }
        assertResEqualFile(res, 'expected/file.json')
        done()
      })
  })
})
