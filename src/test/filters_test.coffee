
request = require 'supertest'

{assertResEqualFile} = require './fixtures/utils'
appFactory = require('./fixtures/app')
app = null


before (done) ->
  app = appFactory(done)

describe 'GET : Play with image filters', () ->
  it 'Should return a 200 OK by modifying the image', (done) ->
    request app
      .get '/test/blur(5,2)&/igloo.jpg'
      .expect 200
      .end (err, res) ->
        return done err if err
        assertResEqualFile res, 'expected/blur(5,2)_igloo.jpg'
        done()

  it 'Should return a 200 OK by using an unknown filter', (done) ->
    request app
      .get '/test/unknown&/igloo.jpg'
      .expect 200, done

  it 'Should return 200 OK by using a filter on a non image file', (done) ->
    request app
      .get '/test/196&/file.json'
      .expect 200
      .end (err, res) ->
        return done err if err
        assertResEqualFile res, 'expected/file.json'
        done()
