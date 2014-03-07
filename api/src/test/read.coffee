#
# READ FILE
#

chai = require 'chai'
assert = chai.assert
request = require 'supertest'
appFactory = require('./fixtures/app')
app = null

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
      .get '/test/igloo2.jpg'
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
        #console.log 'ARGS: ', arguments
        return done err if err
        done()