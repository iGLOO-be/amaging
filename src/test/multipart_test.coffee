
chai = require 'chai'
assert = chai.assert
chai.should()

request = require 'supertest'

{requestMultipartFileToken, assertResEqualFile} = require './fixtures/utils'
appFactory = require('./fixtures/app')
app = null


before (done) ->
  app = appFactory(done)

###
        ADD IMAGE IN MULTIPART
###
describe 'POST a new image file', () ->
  it 'Should return a 404 not found when retreive the image that doesn\'t exist', (done) ->
    request app
      .get '/test/tente.jpg'
      .expect 404, (err) ->
        return done err if err
        done()

  it 'Should return a 200 OK when adding an image in multipart (tente.jpg)', (done) ->
    tok = requestMultipartFileToken('expected/tente.jpg', 'tente.jpg')
    request app
      .post '/test/tente.jpg'
      .set 'x-authentication', tok.access
      .set 'x-authentication-token', tok.token
      .attach 'img', tok.file.path
      .expect 200, (err) ->
        return done err if err
        done()

  it 'Should return the same hash as the expected tente.jpg hash', (done) ->
    request app
      .get '/test/tente.jpg'
      .expect 200
      .end (err, res) ->
        return done err if err
        assertResEqualFile(res, 'expected/tente.jpg')
        done()


###
        BIG IMAGE IN MULTIPART
###
describe 'Upload large file to potentialy generate errors', () ->
  it 'Should return a 404 not found when retreive the image that doesn\'t exist', (done) ->
    request app
      .get '/test/zombies.jpg'
      .expect 404, (err) ->
        return done err if err
        done()

###
        CACHE EVICTION UPDATE FILE MULTIPART
###
describe 'Cache Eviction by updating file in multipart', () ->
  describe 'POST an image', () ->
    it 'Should return a 200 OK when adding an image in multipart (cache-eviction-update.jpg)', (done) ->
      tok = requestMultipartFileToken('expected/igloo.jpg', 'cache-eviction-update.jpg')
      request app
        .post '/test/cache-eviction-update.jpg'
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-token', tok.token
        .attach 'img', tok.file.path
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

  describe 'UPDATE the original file (cache-eviction-update.jpg by tente.jpg) to erase the cache', () ->
    it 'Should return a 200 OK by updating the original image in multipart', (done) ->
      tok = requestMultipartFileToken('expected/tente.jpg', 'cache-eviction-update.jpg')
      request app
        .put '/test/cache-eviction-update.jpg'
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-token', tok.token
        .attach 'img', tok.file.path
        .expect 200, (err) ->
          return done err if err
          done()

  describe 'GET: Apply image filter on the tipi and compare hash with the former igloo cached file', () ->
    it 'Should return the right hash of the image to check if the cache has been erased', (done) ->
      request app
        .get '/test/410x410&/cache-eviction-update.jpg'
        .end (err, res) ->
          return done err if err
          assertResEqualFile res, 'expected/410x410_tente.jpg'
          done()
