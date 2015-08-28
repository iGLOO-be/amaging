
chai = require 'chai'
assert = chai.assert
chai.should()

request = require 'supertest'

{requestPolicyFileToken, assertResImageEqualFile} = require './fixtures/utils'
appFactory = require('./fixtures/app')
app = null


before (done) ->
  app = appFactory(done)

describe 'Policy', ->

  ###
          VALID POLICY
  ###
  describe 'POST a new image file with a valid policy', () ->
    it 'Should return a 404 not found when retreive the image that doesn\'t exist', (done) ->
      request app
        .get '/test/policy/tente.jpg'
        .expect 404, done

    it 'Should return a 200 OK when adding an image in multipart (tente.jpg)', (done) ->
      pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00'
      })
      request app
        .post '/test/policy/tente.jpg'
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-policy', pol.policy
        .set 'x-authentication-token', pol.token
        .attach 'img', pol.file_path
        .expect 200, done

    it 'Should return the same hash as the expected tente.jpg hash', (done) ->
      request app
        .get '/test/policy/tente.jpg'
        .expect 200
        .end (err, res) ->
          return done err if err
          assertResImageEqualFile res, 'expected/tente.jpg', done

  ###
          EXPIRED POLICY
  ###
  describe 'POST a new image file with a expired policy', () ->
    it 'Should return a 404 not found when retreive the image that doesn\'t exist', (done) ->
      request app
        .get '/test/policy/expired.jpg'
        .expect 404, done

    it 'Should return a 403 when adding an image in multipart with a expired', (done) ->
      pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '1970-01-01T00:00:00'
      })
      request app
        .post '/test/policy/expired.jpg'
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-policy', pol.policy
        .set 'x-authentication-token', pol.token
        .attach 'img', pol.file_path
        .expect 403, done

    it 'Should return a 404 not found when retreive the image that doesn\'t exist', (done) ->
      request app
        .get '/test/policy/expired.jpg'
        .expect 404, done

  ###
          INVALID POLICY
  ###
  describe 'POST a new image file with a invalid policy', () ->
    it 'Should return a 404 not found when retreive the image that doesn\'t exist', (done) ->
      request app
        .get '/test/policy/invalid.jpg'
        .expect 404, done

    it 'Should return a 400 Bad Request when adding an image in multipart with a invalid', (done) ->
      pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'key', 'some-key']
        ]
      })
      request app
        .post '/test/policy/invalid.jpg'
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-policy', pol.policy
        .set 'x-authentication-token', pol.token
        .attach 'img', pol.file_path
        .expect 400, done

    it 'Should return a 404 not found when retreive the image that doesn\'t exist', (done) ->
      request app
        .get '/test/policy/invalid.jpg'
        .expect 404, done


  ###
          POLICY ERRORS
  ###
  describe 'Policy Error', ->
    it 'Should return a Bad Request in policy is not validated', (done) ->
      pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'key', 'some-key']
        ]
      })
      request app
        .post '/test/policy/invalid.jpg'
        .set 'accept', 'application/json'
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-policy', pol.policy
        .set 'x-authentication-token', pol.token
        .attach 'img', pol.file_path
        .expect 400,
          error: 'Bad Request'
          message: 'Invalid value for key: key'
          statusCode: 400
          data:
            key: 'key'
            type: 'INVALID_KEY'
        , done

    it 'Should return a Forbidden when policy is expired', (done) ->
      pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '1970-01-01T00:00:00',
        conditions: []
      })
      request app
        .post '/test/policy/invalid.jpg'
        .set 'accept', 'application/json'
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-policy', pol.policy
        .set 'x-authentication-token', pol.token
        .attach 'img', pol.file_path
        .expect 403,
          error: 'Forbidden'
          message: 'Not Authorized !'
          statusCode: 403
        , done

    it 'Should return a Forbidden when policy conditions are not correct', (done) ->
      pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '1970-01-01T00:00:00',
        conditions: [
          ['not-existing-validator', 'key', 'some-key']
        ]
      })
      request app
        .post '/test/policy/invalid.jpg'
        .set 'accept', 'application/json'
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-policy', pol.policy
        .set 'x-authentication-token', pol.token
        .attach 'img', pol.file_path
        .expect 403,
          error: 'Forbidden'
          message: 'Not Authorized !'
          statusCode: 403
        , done

  ###
          ACTION RESTRICTION
  ###
  describe 'Policy Action Restriction', () ->
    it 'Should return a 200 if creation is allowed', (done) ->
      pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'action', 'create']
        ]
      })
      request app
        .post '/test/policy/action-restriction/creation-allowed.jpg'
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-policy', pol.policy
        .set 'x-authentication-token', pol.token
        .attach 'img', pol.file_path
        .expect 200, done

    it 'Should return a 400 if creation is not allowed', (done) ->
      pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'action', 'update']
        ]
      })
      request app
        .post '/test/policy/action-restriction/creation-not-allowed.jpg'
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-policy', pol.policy
        .set 'x-authentication-token', pol.token
        .attach 'img', pol.file_path
        .expect 400, done

    it 'Should return a 200 if update is allowed', (done) ->
      # Creation
      pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'action', 'create']
        ]
      })
      request app
        .post '/test/policy/action-restriction/update-allowed.jpg'
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-policy', pol.policy
        .set 'x-authentication-token', pol.token
        .attach 'img', pol.file_path
        .expect 200, (err) ->
          return done err if err

          pol = requestPolicyFileToken('expected/tente.jpg', {
            expiration: '2025-01-01T00:00:00',
            conditions: [
              ['eq', 'action', 'update']
            ]
          })
          request app
            .post '/test/policy/action-restriction/update-allowed.jpg'
            .set 'x-authentication', 'apiaccess'
            .set 'x-authentication-policy', pol.policy
            .set 'x-authentication-token', pol.token
            .attach 'img', pol.file_path
            .expect 200, done

    it 'Should return a 400 if update is not allowed', (done) ->
      # Creation
      pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'action', 'create']
        ]
      })
      request app
        .post '/test/policy/action-restriction/update-not-allowed.jpg'
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-policy', pol.policy
        .set 'x-authentication-token', pol.token
        .attach 'img', pol.file_path
        .expect 200, (err) ->
          return done err if err

          pol = requestPolicyFileToken('expected/tente.jpg', {
            expiration: '2025-01-01T00:00:00',
            conditions: [
              ['eq', 'action', 'create']
            ]
          })
          request app
            .post '/test/policy/action-restriction/update-not-allowed.jpg'
            .set 'x-authentication', 'apiaccess'
            .set 'x-authentication-policy', pol.policy
            .set 'x-authentication-token', pol.token
            .attach 'img', pol.file_path
            .expect 400, done

    it 'Should return a 200 if delete is allowed', (done) ->
      # Creation
      pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'action', 'create']
        ]
      })
      request app
        .post '/test/policy/action-restriction/delete-allowed.jpg'
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-policy', pol.policy
        .set 'x-authentication-token', pol.token
        .attach 'img', pol.file_path
        .expect 200, (err) ->
          return done err if err

          pol = requestPolicyFileToken('expected/tente.jpg', {
            expiration: '2025-01-01T00:00:00',
            conditions: [
              ['eq', 'action', 'delete']
            ]
          })
          request app
            .del '/test/policy/action-restriction/delete-allowed.jpg'
            .set 'x-authentication', 'apiaccess'
            .set 'x-authentication-policy', pol.policy
            .set 'x-authentication-token', pol.token
            .attach 'img', pol.file_path
            .expect 200, done

    it 'Should return a 400 if delete is allowed', (done) ->
      # Creation
      pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'action', 'create']
        ]
      })
      request app
        .post '/test/policy/action-restriction/delete-not-allowed.jpg'
        .set 'x-authentication', 'apiaccess'
        .set 'x-authentication-policy', pol.policy
        .set 'x-authentication-token', pol.token
        .attach 'img', pol.file_path
        .expect 200, (err) ->
          return done err if err

          pol = requestPolicyFileToken('expected/tente.jpg', {
            expiration: '2025-01-01T00:00:00',
            conditions: [
              ['eq', 'action', 'create']
            ]
          })
          request app
            .del '/test/policy/action-restriction/delete-not-allowed.jpg'
            .set 'x-authentication', 'apiaccess'
            .set 'x-authentication-policy', pol.policy
            .set 'x-authentication-token', pol.token
            .attach 'img', pol.file_path
            .expect 400, done



# ###
#         BIG IMAGE IN MULTIPART
# ###
# describe 'Upload large file to potentialy generate errors', () ->
#   it 'Should return a 404 not found when retreive the image that doesn\'t exist', (done) ->
#     request app
#       .get '/test/zombies.jpg'
#       .expect 404, (err) ->
#         return done err if err
#         done()

# ###
#         CACHE EVICTION UPDATE FILE MULTIPART
# ###
# describe 'Cache Eviction by updating file in multipart', () ->
#   describe 'POST an image', () ->
#     it 'Should return a 200 OK when adding an image in multipart (cache-eviction-update.jpg)', (done) ->
#       tok = requestMultipartFileToken('expected/igloo.jpg', 'multipart-cache-eviction-update.jpg')
#       request app
#         .post '/test/multipart-cache-eviction-update.jpg'
#         .set 'x-authentication', 'apiaccess'
#         .set 'x-authentication-token', tok.token
#         .attach 'img', tok.file.path
#         .expect 200, (err) ->
#           return done err if err
#           done()

#   describe 'GET: Apply image filter to create cache storage', () ->
#     it 'Should return a 200 OK by changing the igloo', (done) ->
#       request app
#         .get '/test/410x410&/multipart-cache-eviction-update.jpg'
#         .expect 200, (err) ->
#           return done err if err
#           done()

#   describe 'UPDATE the original file (cache-eviction-update.jpg by tente.jpg) to erase the cache', () ->
#     it 'Should return a 200 OK by updating the original image in multipart', (done) ->
#       tok = requestMultipartFileToken('expected/tente.jpg', 'multipart-cache-eviction-update.jpg')
#       request app
#         .put '/test/multipart-cache-eviction-update.jpg'
#         .set 'x-authentication', 'apiaccess'
#         .set 'x-authentication-token', tok.token
#         .attach 'img', tok.file.path
#         .expect 200, (err) ->
#           return done err if err
#           done()

#   describe 'GET: Apply image filter on the tipi and compare hash with the former igloo cached file', () ->
#     it 'Should return the right hash of the image to check if the cache has been erased', (done) ->
#       request app
#         .get '/test/410x410&/multipart-cache-eviction-update.jpg'
#         .end (err, res) ->
#           return done err if err
#           assertResImageEqualFile res, 'expected/410x410_tente.jpg', done
