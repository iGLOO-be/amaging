
chai = require 'chai'
assert = chai.assert
expect = chai.expect
chai.should()


request = require 'supertest'

{requestFileToken, requestJSONToken, requestDeleteToken, assertResEqualFile} = require './fixtures/utils'
appFactory = require('./fixtures/app')
app = null


before (done) ->
  app = appFactory(done)


###
        READ
###
describe 'GET a file\n', () ->
  it 'Should return a 404 error because of an unexpected url', (done) ->
    request app
      .get '/notExist.png'
      .expect 404, done

  it 'Should return a 200 OK because the file exist', (done) ->
    request app
      .get '/test/igloo.jpg'
      .expect 200, done

  it 'Should return a 403 error Forbidden because of an non-existing cid', (done) ->
    request app
      .get '/notExits/file.png'
      .expect 403, done

  it 'Should return a 404 not found because the image doesn\'t exist', (done) ->
    request app
      .get '/test/file.png'
      .expect 404, done

  it 'Should return a 404 not found because the file doesn\'t exist', (done) ->
    request app
      .get '/test/igloo.json'
      .expect 404, done

  it 'Should return a 404 not found because no file specified', (done) ->
    request app
      .get '/test/'
      .expect 404, done

###
        HEAD
###
describe 'HEAD a file\n', () ->
  it 'Should return a 404 error because the file doesn\'t exist', (done) ->
    request app
      .head '/igl00.png'
      .expect 404, done

  it 'Should return a 200 OK with file info', (done) ->
    request app
      .head '/test/igloo.jpg'
      .expect 200
      .end (err, res) ->
        expect(err).to.be.null
        expect(res.headers['content-type']).to.be.equals('image/jpeg')
        done()


###
        WRITE
###
describe 'POST a new json file and check his Content-Type\n', () ->
  it 'Should return a 404 not found when retreive the file that doesn\'t exist', (done) ->
    request app
      .get '/test/notExist.json'
      .expect 404, (err) ->
        return done err if err
        done()

  it 'Should return a 200 OK by adding a json file', (done) ->
    tok = requestJSONToken(JSON.stringify(
      test: true
    ), 'file.json')
    request app
      .post '/test/file.json'
      .type tok.contentType
      .set 'x-authentication', tok.access
      .set 'x-authentication-token', tok.token
      .send tok.buffer
      .expect 200, (err) ->
        return done err if err
        done()

  it 'Should return the json Content-Type and the content of the file.json', (done) ->
    request app
      .get '/test/file.json'
      .set 'Accept', 'application/json'
      .end (err, res) ->
        return done err if err
        assert.equal(res.text, JSON.stringify(
          test: true
        ))
        assert.equal(res.headers['content-type'], 'application/json')
        done()



describe 'POST a new image file\n', () ->
  it 'Should return a 404 not found when retreive the image that doesn\'t exist', (done) ->
    request app
      .get '/test/test.jpg'
      .expect 404, (err) ->
        return done err if err
        done()

  it 'Should return a 200 OK when adding an image (igloo.jpg)', (done) ->
    tok = requestFileToken('expected/igloo.jpg', 'igloo.jpg', 'image/jpeg')
    request app
      .post '/test/igloo.jpg'
      .type tok.contentType
      .set 'Content-Length', tok.length
      .set 'x-authentication', tok.access
      .set 'x-authentication-token', tok.token
      .send tok.buffer
      .expect 200, (err) ->
        return done err if err
        done()

  it 'Should return a 200 OK when retreive igloo.jpg', (done) ->
    request app
      .get '/test/igloo.jpg'
      .expect 200
      .end (err, res) ->
        return done err if err
        assertResEqualFile(res, 'expected/igloo.jpg')
        done()



describe 'POST : authentication\n', () ->
  it 'Should return a 403 error NOT AUTHORIZED because of no token provided', (done) ->
    request app
      .post '/test/file.json'
      .type 'application/json'
      .set 'x-authentication', 'apiaccess'
      .send "{\"test_no_token\":1}"
      .expect 403, (err) ->
        return done err if err
        done()

  it 'Should return a 403 error NOT AUTHORIZED because of no api access provided', (done) ->
    request app
      .post '/test/file.json'
      .type 'application/json'
      .set 'x-authentication-token', 'fake-token'
      .send "{\"test_no_token\":1}"
      .expect 403, (err) ->
        return done err if err
        done()

  it 'Should return a 403 error NOT AUTHORIZED because of an altered token', (done) ->
    request app
      .post '/test/file.json'
      .type 'application/json'
      .set 'x-authentication', 'apiaccess'
      .set 'x-authentication-token', 'fake-token'
      .send "{\"test\":1}"
      .expect 403, (err) ->
        return done err if err
        done()



###
        DELETE
###
describe 'DELETE files just added\n', () ->
  it 'Should return a 200 OK by erasing the image', (done) ->
    request app
      .del '/test/delete.jpg'
      .set 'x-authentication', 'apiaccess'
      .set 'x-authentication-token', requestDeleteToken('delete.jpg')
      .expect 200, (err) ->
        return done err if err
        done()

  it 'Should return a 404 not found by erasing the same image AGAIN', (done) ->
    request app
      .del '/test/delete.jpg'
      .set 'x-authentication', 'apiaccess'
      .set 'x-authentication-token', requestDeleteToken('delete.jpg')
      .expect 404, (err) ->
        return done err if err
        done()

  it 'Should return a 404 if getting file', (done) ->
    request app
      .get '/test/delete.jpg'
      .expect 404, (err) ->
        return done err if err
        done()

