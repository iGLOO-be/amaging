
import request from 'supertest'

import appFactory from './fixtures/app'

import chai from 'chai'
const { assert } = chai

/*
        ENABLE CORS
*/

describe('CORS Support', () => {
  test('CORS are not enabled by default', done => {
    const app = appFactory(function (err) {
      if (err) { return done(err) }
      request(app)
        .options('/test/some/file')
        .expect(200, function (err, res) {
          if (err) { return done(err) }
          assert.isUndefined(res.headers['access-control-allow-origin'])
          assert.isUndefined(res.headers['access-control-allow-methods'])
          return done(err)
        })
    })
  })

  test('CORS can be enabled with option cors = true', done => {
    const app = appFactory(
      {cors: true}
      , function (err) {
        if (err) { return done(err) }
        request(app)
          .options('/test/some/file')
          .expect(204, function (err, res) {
            if (err) { return done(err) }
            assert.equal(res.headers['access-control-allow-origin'], '*')
            assert.equal(res.headers['access-control-allow-methods'], 'GET,HEAD,PUT,PATCH,POST,DELETE')
            return done(err)
          })
      })
  })

  return test('CORS can be enabled with option cors = [empty object]', done => {
    const app = appFactory(
      {cors: {}}
      , function (err) {
        if (err) { return done(err) }
        request(app)
          .options('/test/some/file')
          .expect(204, function (err, res) {
            if (err) { return done(err) }
            assert.equal(res.headers['access-control-allow-origin'], '*')
            assert.equal(res.headers['access-control-allow-methods'], 'GET,HEAD,PUT,PATCH,POST,DELETE')
            return done(err)
          })
      })
  });
})
