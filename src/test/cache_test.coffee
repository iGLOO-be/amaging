
request = require 'supertest'

{requestFileToken, requestDeleteToken, assertResImageEqualFile} = require './fixtures/utils'
appFactory = require('./fixtures/app')
app = null


before (done) ->
  app = appFactory(done)


###
        CACHE EVICTION DELETE FILE
###

describe 'Cache Eviction by deleting file', () ->
  it 'Should return a 200 OK when retreive cache-eviction-delete.jpg', (done) ->
    request app
      .get '/test/cache-eviction-delete.jpg'
      .expect 200, done

  describe 'GET: Apply image filter to create cache storage', () ->
    it 'Should return a 200 OK by bluring the image', (done) ->
      request app
        .get '/test/blur(10,2)&/cache-eviction-delete.jpg'
        .expect 200, (err) ->
          return done err if err
          done()

    it 'Should return a 200 OK by resizing the image', (done) ->
      request app
        .get '/test/100x100&/cache-eviction-delete.jpg'
        .expect 200, (err) ->
          return done err if err
          done()


  describe 'DELETE the original file (cache-eviction-delete.jpg) to erase the cache', () ->
    it 'Should return a 200 OK by erasing the original image', (done) ->
      request app
        .del '/test/cache-eviction-delete.jpg'
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-token', requestDeleteToken('cache-eviction-delete.jpg')
        .expect 200, (err) ->
          return done err if err
          done()

  describe 'GET: Try to apply other changes to the file just erased', () ->
    it 'Should return a 404 not found because the image has been deleted', (done) ->
      request app
        .get '/test/blur(8,2)&/cache-eviction-delete.jpg'
        .expect 404, (err) ->
          return done err if err
          done()


###
        CACHE EVICTION UPDATE FILE
###

describe 'Cache Eviction by updating file', () ->
  describe 'POST an image', () ->
    it 'Should return a 200 OK when adding an image (cache-eviction-update.jpg)', (done) ->
      tok = requestFileToken('expected/igloo.jpg', 'cache-eviction-update.jpg', 'image/jpeg')
      request app
        .post '/test/cache-eviction-update.jpg'
        .type tok.contentType
        .set 'Content-Length', tok.length
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-token', tok.token
        .send tok.buffer
        .expect 200, (err) ->
          return done err if err
          done()

  describe 'GET: Apply image filter to create cache storage', () ->
    it 'Should return a 200 OK by changing the igloo', (done) ->
      request app
        .get '/test/410x410&/cache-eviction-update.jpg'
        .expect 200, (err) ->
          return done err if err
          done()

  describe 'UPDATE the original file (cache-eviction-update.jpg by tipi.jpg) to erase the cache', () ->
    it 'Should return a 200 OK by updating the original image', (done) ->
      tok = requestFileToken('expected/tipi.jpg', 'cache-eviction-update.jpg', 'image/jpeg')
      request app
        .post '/test/cache-eviction-update.jpg'
        .type tok.contentType
        .set 'Content-Length', tok.length
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-token', tok.token
        .send tok.buffer
        .expect 200, (err) ->
          return done err if err
          done()

  describe 'GET: Apply image filter on the tipi and compare hash with the former igloo cached file', () ->
    it 'Should return the right hash of the image to check if the cache has been erased', (done) ->
      request app
        .get '/test/410x410&/cache-eviction-update.jpg'
        .end (err, res) ->
          return done err if err
          assertResImageEqualFile res, 'expected/410x410_tipi.jpg', done
