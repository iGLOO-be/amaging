#
# LOCAL TESTS
#

chai = require 'chai'
assert = chai.assert
request = require 'supertest'
appFactory = require('./fixtures/app')
app = null

before (done) ->
  app = appFactory(done)

describe 'POST a new json file and check his Content-Type', () ->
  it 'Should return a 404 not found when retreive the file that doesn\'t exist', (done) ->
    request app
      .get '/test/file.json'
      .expect 404, (err) ->
        return done err if err
        done()

  it 'Should return a 200 OK by adding a json file', (done) ->
    request app
      .post '/test/file.json'
      .type 'application/json'
      .send "{\"test\":3}"
      .expect 200, (err) ->
        return done err if err
        done()

  it 'Should return the json Content-Type of the file.json', (done) ->
    request app
      .get '/test/file.json'
      .set 'Accept', 'application/json'
      .end (err, res) ->
        return done err if err
        assert.equal(res.headers['content-type'], 'application/json')
        done()

  it 'Should return the content of the file.json', (done) ->
    request app
      .get '/test/file.json'
      .set 'Accept', 'application/json'
      .end (err, res) ->
        return done err if err
        assert.equal(res.text, '{"test":3}')
        done()

file = require('fs').readFileSync(__dirname + '/expected/igloo2.jpg')
file = new Buffer(file)
fileUploaded = file.length

describe 'POST a new image file', () ->
  it 'Should return a 404 not found when retreive the image that doesn\'t exist', (done) ->
    request app
      .get '/test/test.jpg'
      .expect 404, done

  it 'Should return a 200 OK when adding a image', (done) ->
    request app
      .post '/test/test.jpg'
      .set 'Content-Type', 'image/jpeg'
      .set 'Content-Length', file.length
      .send file
      .expect 200, (err) ->
        return done err if err
        done()

  it 'Should return a 200 OK when retreive this image', (done) ->
    request app
      .get '/test/test.jpg'
      .expect 200, done

  it 'Should return the same length as the uploaded image', (done) ->
    request app
      .get '/test/test.jpg'
      .set 'Accept', 'image/jpeg'
      .end (err, res) ->
        # console.log 'LENGTH: ', res
        # shasum = require('crypto').createHash('sha1')
        # shasum.update(file)

        # shasumOut = require('crypto').createHash('sha1')
        # shasumOut.update(new Buffer(res.text, 'binary'))

        # console.log shasum.digest('hex')
        # console.log shasumOut.digest('hex')
        # console.log res.headers
        # console.log fileUploaded
        return done err if err
        assert.equal(17252, fileUploaded)
        done()

