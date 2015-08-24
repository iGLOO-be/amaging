
chai = require 'chai'
assert = chai.assert
chai.should()

request = require 'supertest'

{requestFileToken} = require './fixtures/utils'
appFactory = require('./fixtures/app')
app = null


return unless process.env.TEST_ENV == 's3'

describe 'S3 Storage', ->

  ###
          INVALID CREDENTIALS
  ###
  describe 'Invalid Credentials', () ->
    before (done) ->
      app = appFactory
        __skip_populate: true
        customers:
          test:
            storage:
              options:
                secret: 'false'
            cacheStorage:
              options:
                secret: 'false'
      , done

    it 'Get file should return a 500', (done) ->
      request app
        .get '/test/igloo.jpg'
        .expect 500, 'Invalid HEAD response from S3. (Status: 403)', done

    it 'Head file should return a 500', (done) ->
      request app
        .head '/test/igloo.jpg'
        .expect 500, done

    it 'Put file should return a 500', (done) ->
      tok = requestFileToken('expected/igloo.jpg', 'igloo.jpg', 'image/jpeg')
      request app
        .post '/test/igloo.jpg'
        .type tok.contentType
        .set 'Content-Length', tok.length
        .set 'x-authentication', tok.access
        .set 'x-authentication-token', tok.token
        .send tok.buffer
        .expect 500, 'Invalid HEAD response from S3. (Status: 403)', (err) ->
          return done err if err
          done()

