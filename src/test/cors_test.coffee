
chai = require 'chai'
assert = chai.assert

request = require 'supertest'

{requestFileToken, requestDeleteToken, assertResEqualFile} = require './fixtures/utils'
appFactory = require('./fixtures/app')


###
        ENABLE CORS
###

describe 'CORS Support', () ->
  it 'CORS are not enabled by default', (done) ->
    app = appFactory((err) ->
      return done err if err
      request app
        .options '/test/some/file'
        .expect 200, (err, res) ->
          return done err if err
          assert.isUndefined(res.headers['access-control-allow-origin'])
          assert.isUndefined(res.headers['access-control-allow-methods'])
          done err
    )

  it 'CORS can be enabled with option cors = true', (done) ->
    app = appFactory(
      cors: true
    , (err) ->
      return done err if err
      request app
        .options '/test/some/file'
        .expect 204, (err, res) ->
          return done err if err
          assert.equal(res.headers['access-control-allow-origin'], '*')
          assert.equal(res.headers['access-control-allow-methods'], 'GET,HEAD,PUT,PATCH,POST,DELETE')
          done err
    )

  it 'CORS can be enabled with option cors = [empty object]', (done) ->
    app = appFactory(
      cors: {}
    , (err) ->
      return done err if err
      request app
        .options '/test/some/file'
        .expect 204, (err, res) ->
          return done err if err
          assert.equal(res.headers['access-control-allow-origin'], '*')
          assert.equal(res.headers['access-control-allow-methods'], 'GET,HEAD,PUT,PATCH,POST,DELETE')
          done err
    )
