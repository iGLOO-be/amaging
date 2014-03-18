chai = require 'chai'
assert = chai.assert
chai.should()
request = require 'supertest'
appFactory = require('./fixtures/app')
app = null
crypto = require 'crypto'
server = require '../amaging/server'

file = require('fs').readFileSync(__dirname + '/expected/igloo2.jpg')
file = new Buffer(file)
fileUploaded = file.length

tipi = require('fs').readFileSync(__dirname + '/expected/tipi.jpg')
tipi = new Buffer(tipi)
tipiUploaded = tipi.length

original_buf = new Buffer(file.toString(), 'base64')
original_img_hash = crypto.createHash('sha1')
  .update(original_buf)
  .digest('hex')

original_blur_hash = null

# Prepare token to use in differents 'it'

token = crypto.createHash('sha1')
  .update('test' + 'apiaccess' + '4ec2b79b81ee67e305b1eb4329ef2cd1' + 'test.jpg' + 'image/jpeg' + fileUploaded)
  .digest('hex')

token_cache = crypto.createHash('sha1')
  .update('test' + 'apiaccess' + '4ec2b79b81ee67e305b1eb4329ef2cd1' + 'igloo.jpg' + 'image/jpeg' + fileUploaded)
  .digest('hex')

token_cache_tipi = crypto.createHash('sha1')
  .update('test' + 'apiaccess' + '4ec2b79b81ee67e305b1eb4329ef2cd1' + 'igloo.jpg' + 'image/jpeg' + tipiUploaded)
  .digest('hex')

token_cache_del = crypto.createHash('sha1')
  .update('test' + 'apiaccess' + '4ec2b79b81ee67e305b1eb4329ef2cd1' + 'igloo.jpg')
  .digest('hex')

addJson = "{\"test\":3}"
token_json = crypto.createHash('sha1')
  .update('test' + 'apiaccess' + '4ec2b79b81ee67e305b1eb4329ef2cd1' + 'file.json' +
    'application/json' + addJson.length)
  .digest('hex')

wAPI_userId = "{\"test_bad_ct\":1}"
token_err = crypto.createHash('sha1')
  .update('test' + 'apiaccess' + 'azerty9b81ee67e305b1eb4329e00000' +
    'file.json' + 'application/json' + wAPI_userId.length)
  .digest('hex')

missSecret = "{\"test_no_api_secret\":1}"
token_json_noSecret = crypto.createHash('sha1')
  .update('test' + 'apiaccess' + 'file.json' + 'application/json' + missSecret.length)
  .digest('hex')

wrongCreds = "{\"test_wrong_creds\":1}"
token_json_wCreds = crypto.createHash('sha1')
  .update('test' + 'apiaccess' + '4ec2b79b81ee67e305b1eb4329ef2cd1' +
    'file.json' + 'application/json' + wrongCreds.length)
  .digest('hex')

altToken = "{\"test_err_token\":1}"
altered_token_json = crypto.createHash('sha1')
  .update('test' + 'APIaccess' + '4ec2b79baaaaaaa305b1eb4329ef2cd1' +
    'file.json' + 'application/json' + altToken.length)
  .digest('hex')

token_del_img = crypto.createHash('sha1')
  .update('test' + 'apiaccess' + '4ec2b79b81ee67e305b1eb4329ef2cd1' + 'test.jpg')
  .digest('hex')

# Example of a bad config of S3 credentials

# wrong_app = server (
#   customers:
#     test:
#       access:
#         'apiaccess': '4ec2b79b81ee67e305b1eb4329ef2cd1'
#       storage:
#         type: 's3'
#         options:
#           bucket: 'igloo-s3-test'
#           path: 'storage/main/'
#           key: 'TRY'
#           secret: 'AGAIN'
#           region: 'eu-west-1'
#       cacheStorage:
#         type: 's3'
#         options:
#           bucket: 'igloo-s3-test'
#           path: 'storage/cache/'
#           key: 'TRY'
#           secret: 'AGAIN'
#           region: 'eu-west-1'
#   )

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
      .send addJson
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

  it 'Should return a 200 OK when adding an image (test.jpg)', (done) ->
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

  it 'Should return a 200 OK when adding an image (igloo.jpg)', (done) ->
    request app
      .post '/test/igloo.jpg'
      .set 'Content-Type', 'image/jpeg'
      .set 'Content-Length', file.length
      .set 'x-authentication', 'apiaccess'
      .set 'x-authentication-token', token_cache
      .send file
      .expect 200, (err) ->
        return done err if err
        done()

  it 'Should return a 200 OK when retreive test.jpg', (done) ->
    request app
      .get '/test/test.jpg'
      .expect 200, done

  it 'Should return a 200 OK when retreive igloo.jpg', (done) ->
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
      .set 'x-authentication-token', altered_token_json
      .send altToken
      .expect 403, (err) ->
        return done err if err
        done()

  # it 'Should return a 403 error NOT AUTHORIZED because of wrong S3 credentials', (done) ->
  #   request wrong_app
  #     .post '/test/file.json'
  #     .type 'application/json'
  #     .set 'x-authentication', 'apiaccess'
  #     .set 'x-authentication-token', token_json_wCreds
  #     .send wrongCreds
  #     .expect 500, (err) ->
  #       return done err if err
  #       done()

  it 'Should return a 403 error NOT AUTHORIZED because of no token provided', (done) ->
    request app
      .post '/test/file.json'
      .type 'application/json'
      .set 'x-authentication', 'apiaccess'
      .send "{\"test_no_token\":1}"
      .expect 403, (err) ->
        return done err if err
        done()

  it 'Should return a 403 error NOT AUTHORIZED because of missing API user secret', (done) ->
    request app
      .post '/test/file.json'
      .type 'application/json'
      .set 'x-authentication', 'apiaccess'
      .set 'x-authentication-token', token_json_noSecret
      .send missSecret
      .expect 403, (err) ->
        return done err if err
        done()

  it 'Should return a 403 error NOT AUTHORIZED because of wrong content-type and API user id', (done) ->
    request app
      .post '/test/file.json'
      .type 'application/json'
      .set 'x-authentication', 'apiaccess'
      .set 'x-authentication-token', token_err
      .send wAPI_userId
      .expect 403, (err) ->
        return done err if err
        done()

describe 'GET : Play with image filters', () ->
  it 'Should return a 200 OK by modifying the image', (done) ->
    request app
      .get '/test/blur(5,2)&/igloo.jpg'
      .expect 200
      .end (err, res) ->
        return done err if err
        original_blur = new Buffer(res.text, 'base64')
        original_blur_hash = crypto.createHash('sha1')
          .update(original_blur)
          .digest('hex')
        done()

  it 'Should return the same hash from the original and retreived image', (done) ->
    request app
      .get '/test/igloo.jpg'
      .type 'image/jpeg'
      .end (err, res) ->
        return done err if err
        modified_buf = new Buffer(res.text, 'base64')
        modified_img_hash = crypto.createHash('sha1')
          .update(modified_buf)
          .digest('hex')
        assert.equal(original_img_hash, modified_img_hash)
        done()

  it 'The original image should be equal to the modified one', (done) ->
    request app
      .get '/test/blur(5,2)&/igloo.jpg'
      .type 'image/jpeg'
      .end (err, res) ->
        return done err if err
        modified_buf = new Buffer(res.text, 'base64')
        modified_img_hash = crypto.createHash('sha1')
          .update(modified_buf)
          .digest('hex')
        assert.equal(modified_img_hash, modified_img_hash)
        done()

describe 'DELETE files just added', () ->
  it 'Should return a 200 OK by erasing the image', (done) ->
    request app
      .del '/test/test.jpg'
      .set 'x-authentication', 'apiaccess'
      .set 'x-authentication-token', token_del_img
      .expect 200, (err) ->
        return done err if err
        done()

  it 'Should return a 404 not found by erasing the same image AGAIN', (done) ->
    request app
      .del '/test/test.jpg'
      .set 'x-authentication', 'apiaccess'
      .set 'x-authentication-token', token_del_img
      .expect 404, (err) ->
        return done err if err
        done()

describe 'Cache Eviction by deleting file', () ->
  it 'Should return a 200 OK when retreive igloo.jpg', (done) ->
    request app
      .get '/test/igloo.jpg'
      .expect 200, done

  describe 'GET: Apply image filter to create cache storage', () ->
    it 'Should return a 200 OK by bluring the image', (done) ->
      request app
        .get '/test/blur(10,2)&/igloo.jpg'
        .expect 200, (err) ->
          return done err if err
          done()

    it 'Should return a 200 OK by resizing the image', (done) ->
      request app
        .get '/test/100x100&/igloo.jpg'
        .expect 200, (err) ->
          return done err if err
          done()

  describe 'DELETE the original file (igloo.jpg) to erase the cache', () ->
    it 'Should return a 200 OK by erasing the original image', (done) ->
      request app
        .del '/test/igloo.jpg'
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-token', token_cache_del
        .expect 200, (err) ->
          return done err if err
          done()

  describe 'GET: Try to apply other changes to the file just erased', () ->
    it 'Should return a 404 not found because the image has been deleted', (done) ->
      request app
        .get '/test/blur(8,2)&/igloo.jpg'
        .expect 404, (err) ->
          return done err if err
          done()

describe 'Cache Eviction by updating file', () ->
  describe 'POST an image', () ->
    it 'Should return a 200 OK when adding an image (igloo.jpg)', (done) ->
      request app
        .post '/test/igloo.jpg'
        .set 'Content-Type', 'image/jpeg'
        .set 'Content-Length', file.length
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-token', token_cache
        .send file
        .expect 200, (err) ->
          return done err if err
          done()

  describe 'GET: Apply image filter to create cache storage', () ->
    it 'Should return a 200 OK by changing the igloo', (done) ->
      request app
        .get '/test/410x410&/igloo.jpg'
        .expect 200, (err) ->
          return done err if err
          done()

  describe 'UPDATE the original file (igloo.jpg by tipi.jpg) to erase the cache', () ->
    it 'Should return a 200 OK by updating the original image', (done) ->
      request app
        .put '/test/igloo.jpg'
        .set 'Content-Type', 'image/jpeg'
        .set 'Content-Length', tipiUploaded
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-token', token_cache_tipi
        .send tipi
        .expect 200, (err) ->
          return done err if err
          done()

  describe 'GET: Apply image filter to see if cache storage has been deleted', () ->
    it 'Should return a 200 OK by resizing the tipi', (done) ->
      request app
        .get '/test/410x410&/igloo.jpg'
        .expect 200, (err) ->
          return done err if err
          done()