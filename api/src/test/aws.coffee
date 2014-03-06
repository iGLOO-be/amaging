#
# AWS TESTS
#

chai = require 'chai'
should = chai.should
expect = chai.expect
assert = chai.assert
request = require 'supertest'
appFactory = require('./fixtures/app')
app = null

before (done) ->
  app = appFactory(done)

describe 'GET a file from AWS', () ->
  it 'Should return a 404 error because of an unexpected url', (done) ->
    request app
      .get '/notExist.png'
      .expect 404, (err) ->
        return done err if err
        done()