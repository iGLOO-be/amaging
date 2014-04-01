
chai = require 'chai'
assert = chai.assert

request = require 'supertest'
appFactory = require('./fixtures/app')

app = null
cacheControl = 'max-age=604800, public'

if process.env.TEST_ENV == 'local'
  Etag = '"17252"'
  newEtag = '"4667"'
else
  Etag = '"1cc596b7a579db797f8aea80bba65415"'
  newEtag = '"87e765c919874876f1f23f95541522f4"'

before (done) ->
  app = appFactory(done)


###
        CACHE HTTP
###
describe 'MANAGE HTTP CACHE', () ->
  describe 'GET the image', () ->
    it 'Should return a 200', (done) ->
      request app
        .get '/test/ice.jpg'
        .expect 200
        .end (err, res) ->
          return done err if err
          assert.equal(res.headers.etag, Etag)
          assert.equal(res.headers['cache-control'], cacheControl)
          done()

  describe 'GET the image and create cache storage', () ->
    it 'Should return a 200 OK', (done) ->
      request app
        .get '/test/190x180&/ice.jpg'
        .expect 200
        .end (err, res) ->
          return done err if err
          assert.equal(res.headers.etag, newEtag)
          assert.equal(res.headers['cache-control'], cacheControl)
          done()

    ## Via cacheFile
    it 'Should return a 304 not modified (190x180)', (done) ->
      request app
        .get '/test/190x180&/ice.jpg'
        .set 'if-none-match', newEtag
        .expect 304, (err) ->
          return done err if err
          done()

    ## Via file
    it 'Should return a 304 not modified (ice.jpg)', (done) ->
      request app
        .get '/test/ice.jpg'
        .set 'if-none-match', Etag
        .expect 304, done

  ## with different ETag and should return 200
  describe 'GET the image with former Etags', () ->
    it 'Should return a 200 OK (ice.jpg)', (done) ->
      request app
        .get '/test/ice.jpg'
        .set 'if-none-match', newEtag
        .expect 200, done

    ## Via cacheFile
    it 'Should return a 200 OK (190x180)', (done) ->
      request app
        .get '/test/190x180&/ice.jpg'
        .set 'if-none-match', Etag
        .expect 200, done
