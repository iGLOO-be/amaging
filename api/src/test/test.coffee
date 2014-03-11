chai = require 'chai'
assert = chai.assert
request = require 'supertest'
appFactory = require('./fixtures/app')
app = null
crypto = require 'crypto'
server = require '../amaging/server'

token = crypto.createHash('sha1')
  .update('test' + 'apiaccess' + '4ec2b79b81ee67e305b1eb4329ef2cd1' + 'test.jpg' + 'image/jpeg')
  .digest('hex')

token_json = crypto.createHash('sha1')
  .update('test' + 'apiaccess' + '4ec2b79b81ee67e305b1eb4329ef2cd1' + 'file.json' + 'application/json')
  .digest('hex')

token_json_noSecret = crypto.createHash('sha1')
  .update('test' + 'apiaccess' + 'file.json' + 'application/json')
  .digest('hex')

token_err = crypto.createHash('sha1')
  .update('test' + 'apiaccess' + 'azerty9b81ee67e305b1eb4329e00000' + 'file.json' + 'image/jpeg')
  .digest('hex')

file = require('fs').readFileSync(__dirname + '/expected/igloo2.jpg')
file = new Buffer(file)
fileUploaded = file.length

wrong_app = server (
  customers:
    test:
      access:
        'apiaccess': '4ec2b79b81ee67e305b1eb4329ef2cd1'
      storage:
        type: 's3'
        options:
          bucket: 'igloo-s3-test'
          path: 'storage/main/'
          key: 'TRY'
          secret: 'AGAIN'
          region: 'eu-west-1'
      cacheStorage:
        type: 's3'
        options:
          bucket: 'igloo-s3-test'
          path: 'storage/cache/'
          key: 'TRY'
          secret: 'AGAIN'
          region: 'eu-west-1'
  )

before (done) ->
  app = appFactory(done)

describe 'GET a file', () ->
  it 'Should return a 404 error because of an unexpected url', (done) ->
    request app
      .get '/notExist.png'
      .expect 404, (err) ->
        return done err if err
        done()

  it 'Should return a 200 OK because the file exist', (done) ->
    request app
      .get '/test/igloo.jpg'
      .expect 200, (err) ->
        return done(err) if err
        done()

  it 'Should return a 403 error Forbidden because of an non-existing cid', (done) ->
    request app
      .get '/notExits/file.png'
      .expect 403, (err) ->
        return done err if err
        done()

  it 'Should return a 404 not found because the file doesn\'t exist', (done) ->
    request app
      .get '/test/file.png'
      .expect 404, (err) ->
        return done err if err
        done()


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
      .set 'x-authentication', 'apiaccess'
      .set 'x-authentication-token', token_json
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

describe 'POST a new image file', () ->
  it 'Should return a 404 not found when retreive the image that doesn\'t exist', (done) ->
    request app
      .get '/test/test.jpg'
      .expect 404, (err) ->
        return done err if err
        done()

  it 'Should return a 200 OK when adding an image', (done) ->
    request app
      .post '/test/test.jpg'
      .set 'Content-Type', 'image/jpeg'
      .set 'Content-Length', file.length
      .set 'x-authentication', 'apiaccess'
      .set 'x-authentication-token', token
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
        return done err if err
        assert.equal(17252, fileUploaded)
        done()

describe 'POST : authentication on S3', () ->
  it 'Should return a 403 error NOT AUTHORIZED because of an altered token', (done) ->
    request app
      .post '/test/file.json'
      .type 'application/json'
      .set 'x-authentication', 'apiaccess'
      .set 'x-authentication-token', token_err
      .send "{\"test_err_token\":1}"
      .expect 403, (err) ->
        return done err if err
        done()

  it 'Should return a 403 error NOT AUTHORIZED because of wrong S3 credentials', (done) ->
    request wrong_app
      .post '/test/file.json'
      .type 'application/json'
      .set 'x-authentication', 'apiaccess'
      .set 'x-authentication-token', token_err
      .send "{\"test_wrong_creds\":1}"
      .end (err, res) ->
        return done err if err
        assert.equal(res.text, 'Not Authorized !')
        done()

  it 'Should return a 403 error NOT AUTHORIZED because of no token was provided', (done) ->
    request wrong_app
      .post '/test/file.json'
      .type 'application/json'
      .set 'x-authentication', 'apiaccess'
      .send "{\"test_no_token\":1}"
      .expect 403, (err) ->
        return done err if err
        done()

  it 'Should return a 403 error NOT AUTHORIZED because of missing API user secret', (done) ->
    request wrong_app
      .post '/test/file.json'
      .type 'application/json'
      .set 'x-authentication', 'apiaccess'
      .set 'x-authentication-token', token_json_noSecret
      .send "{\"test_no_api_secret\":1}"
      .expect 403, (err) ->
        return done err if err
        done()

  it 'Should return a 403 error NOT AUTHORIZED because of wrong content-type and API user id', (done) ->
    request app
      .post '/test/file.json'
      .type 'application/json'
      .set 'x-authentication', 'apiaccess'
      .set 'x-authentication-token', token_err
      .send "{\"test_bad_ct\":1}"
      .expect 403, (err) ->
        return done err if err
        done()