/* eslint-env jest */

import request from 'supertest'

import {requestPolicyFileToken, assertResImageEqualFilePromise} from './fixtures/utils'
import appFactory from './fixtures/app'
import chai from 'chai'
chai.should()

describe('Policy', () => {
  /*
          VALID POLICY
  */
  describe('POST a new image file with a valid policy', () => {
    test(
      'Should return a 404 not found when retreive the image that doesn\'t exist',
      async () => {
        const app = await appFactory()
        await request(app)
          .get('/test/policy/tente.jpg')
          .expect(404)
      }
    )

    test(
      'Should return a 200 OK when adding an image in multipart (tente.jpg)',
      async () => {
        const pol = requestPolicyFileToken('expected/tente.jpg', {
          expiration: '2025-01-01T00:00:00'
        })
        const app = await appFactory()
        await request(app)
          .post('/test/policy/tente.jpg')
          .set('x-authentication', 'apiaccess')
          .set('x-authentication-policy', pol.policy)
          .set('x-authentication-token', pol.token)
          .attach('img', pol.file_path)
          .expect(200)

        const res = await request(app)
          .get('/test/policy/tente.jpg')
          .expect(200)
        await assertResImageEqualFilePromise(res, 'expected/tente.jpg')
      }
    )

    test(
      'Should return a 200 OK when adding an unknown-type in multipart',
      async () => {
        const pol = requestPolicyFileToken('fixtures/storage/some-file-with-unknown-ext.ozo', {
          expiration: '2025-01-01T00:00:00'
        })
        const app = await appFactory()
        await request(app)
          .post('/test/policy/some-file-with-unknown-ext.ozo')
          .set('x-authentication', 'apiaccess')
          .set('x-authentication-policy', pol.policy)
          .set('x-authentication-token', pol.token)
          .attach('file', pol.file_path)
          .expect(200)
      }
    )

    test(
      'Should return a 200 OK when adding an unknown-type in raw body',
      async () => {
        const pol = requestPolicyFileToken('fixtures/storage/some-file-with-unknown-ext.ozo', {
          expiration: '2025-01-01T00:00:00'
        })
        const app = await appFactory()
        await request(app)
          .post('/test/policy/some-file-with-unknown-ext.ozo')
          .set('x-authentication', 'apiaccess')
          .set('x-authentication-policy', pol.policy)
          .set('x-authentication-token', pol.token)
          .send(require('fs').readFileSync(pol.file_path))
          .expect(200)
      }
    )
  })

  /*
          EXPIRED POLICY
  */
  describe('POST a new image file with a expired policy', () => {
    test(
      'Should return a 404 not found when retreive the image that doesn\'t exist',
      async () => {
        const app = await appFactory()
        await request(app)
          .get('/test/policy/expired.jpg')
          .expect(404)
      }
    )

    test(
      'Should return a 403 when adding an image in multipart with a expired',
      async () => {
        const pol = requestPolicyFileToken('expected/tente.jpg', {
          expiration: '1970-01-01T00:00:00'
        })
        const app = await appFactory()
        await request(app)
          .post('/test/policy/expired.jpg')
          .set('x-authentication', 'apiaccess')
          .set('x-authentication-policy', pol.policy)
          .set('x-authentication-token', pol.token)
          .attach('img', pol.file_path)
          .expect(403)
      }
    )

    return test(
      'Should return a 404 not found when retreive the image that doesn\'t exist',
      async () => {
        const app = await appFactory()
        await request(app)
          .get('/test/policy/expired.jpg')
          .expect(404)
      }
    )
  })

  /*
          INVALID POLICY
  */
  describe('POST a new image file with a invalid policy', () => {
    test(
      'Should return a 404 not found when retreive the image that doesn\'t exist',
      async () => {
        const app = await appFactory()
        await request(app)
          .get('/test/policy/invalid.jpg')
          .expect(404)
      }
    )

    test(
      'Should return a 400 Bad Request when adding an image in multipart with a invalid',
      async () => {
        const app = await appFactory()
        const pol = requestPolicyFileToken('expected/tente.jpg', {
          expiration: '2025-01-01T00:00:00',
          conditions: [
            ['eq', 'key', 'some-key']
          ]
        })
        await request(app)
          .post('/test/policy/invalid.jpg')
          .set('x-authentication', 'apiaccess')
          .set('x-authentication-policy', pol.policy)
          .set('x-authentication-token', pol.token)
          .attach('img', pol.file_path)
          .expect(400)
      }
    )

    return test(
      'Should return a 404 not found when retreive the image that doesn\'t exist',
      async () => {
        const app = await appFactory()
        await request(app)
          .get('/test/policy/invalid.jpg')
          .expect(404)
      }
    )
  })

  /*
          POLICY ERRORS
  */
  describe('Policy Error', () => {
    test('Should return a Bad Request in policy is not validated', async () => {
      const pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'key', 'some-key']
        ]
      })
      const app = await appFactory()
      await request(app)
        .post('/test/policy/invalid.jpg')
        .set('accept', 'application/json')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-policy', pol.policy)
        .set('x-authentication-token', pol.token)
        .attach('img', pol.file_path)
        .expect(400, {
          error: 'Bad Request',
          message: 'Invalid value for key: key',
          statusCode: 400,
          data: {
            key: 'key',
            type: 'INVALID_KEY'
          }
        })
    })

    test('Should return a Forbidden when policy is expired', async () => {
      const pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '1970-01-01T00:00:00',
        conditions: []
      })
      const app = await appFactory()
      await request(app)
        .post('/test/policy/invalid.jpg')
        .set('accept', 'application/json')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-policy', pol.policy)
        .set('x-authentication-token', pol.token)
        .attach('img', pol.file_path)
        .expect(403, {
          error: 'Forbidden',
          message: 'Not Authorized !',
          statusCode: 403
        })
    })

    test(
      'Should return a Forbidden when policy conditions are not correct',
      async () => {
        const pol = requestPolicyFileToken('expected/tente.jpg', {
          expiration: '1970-01-01T00:00:00',
          conditions: [
            ['not-existing-validator', 'key', 'some-key']
          ]
        })
        const app = await appFactory()
        await request(app)
          .post('/test/policy/invalid.jpg')
          .set('accept', 'application/json')
          .set('x-authentication', 'apiaccess')
          .set('x-authentication-policy', pol.policy)
          .set('x-authentication-token', pol.token)
          .attach('img', pol.file_path)
          .expect(403, {
            error: 'Forbidden',
            message: 'Not Authorized !',
            statusCode: 403
          })
      }
    )
  })

  /*
          ACTION RESTRICTION
  */
  return describe('Policy Action Restriction', () => {
    test('Should return a 200 if creation is allowed', async () => {
      const pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'action', 'create']
        ]
      })
      const app = await appFactory()
      await request(app)
        .post('/test/policy/action-restriction/creation-allowed.jpg')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-policy', pol.policy)
        .set('x-authentication-token', pol.token)
        .attach('img', pol.file_path)
        .expect(200)
    })

    test('Should return a 200 if key is allowed', async () => {
      const pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'key', 'policy/action-restriction/creation-allowed.jpg']
        ]
      })
      const app = await appFactory()
      await request(app)
        .post('/test/policy/action-restriction/creation-allowed.jpg')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-policy', pol.policy)
        .set('x-authentication-token', pol.token)
        .attach('img', pol.file_path)
        .expect(200)
    })

    test('Should return a 200 if key is allowed (with slash at begin)', async () => {
      const pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'key', '/policy/action-restriction/creation-allowed.jpg']
        ]
      })
      const app = await appFactory()
      await request(app)
        .post('/test/policy/action-restriction/creation-allowed.jpg')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-policy', pol.policy)
        .set('x-authentication-token', pol.token)
        .attach('img', pol.file_path)
        .expect(200)
    })

    test('Should return a 400 if creation is not allowed', async () => {
      const pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'action', 'update']
        ]
      })
      const app = await appFactory()
      await request(app)
        .post('/test/policy/action-restriction/creation-not-allowed.jpg')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-policy', pol.policy)
        .set('x-authentication-token', pol.token)
        .attach('img', pol.file_path)
        .expect(400)
    })

    test('Should return a 200 if update is allowed', async () => {
      // Creation
      let pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'action', 'create']
        ]
      })
      const app = await appFactory()
      await request(app)
        .post('/test/policy/action-restriction/update-allowed.jpg')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-policy', pol.policy)
        .set('x-authentication-token', pol.token)
        .attach('img', pol.file_path)
        .expect(200)
      pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'action', 'update']
        ]
      })
      await request(app)
        .post('/test/policy/action-restriction/update-allowed.jpg')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-policy', pol.policy)
        .set('x-authentication-token', pol.token)
        .attach('img', pol.file_path)
        .expect(200)
    })

    test('Should return a 400 if update is not allowed', async () => {
      // Creation
      let pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'action', 'create']
        ]
      })
      const app = await appFactory()
      await request(app)
        .post('/test/policy/action-restriction/update-not-allowed.jpg')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-policy', pol.policy)
        .set('x-authentication-token', pol.token)
        .attach('img', pol.file_path)
        .expect(200)
      pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'action', 'create']
        ]
      })
      await request(app)
        .post('/test/policy/action-restriction/update-not-allowed.jpg')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-policy', pol.policy)
        .set('x-authentication-token', pol.token)
        .attach('img', pol.file_path)
        .expect(400)
    })

    test('Should return a 200 if delete is allowed', async () => {
      // Creation
      let pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'action', 'create']
        ]
      })
      const app = await appFactory()
      await request(app)
        .post('/test/policy/action-restriction/delete-allowed.jpg')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-policy', pol.policy)
        .set('x-authentication-token', pol.token)
        .attach('img', pol.file_path)
        .expect(200)
      pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'action', 'delete']
        ]
      })
      await request(app)
        .del('/test/policy/action-restriction/delete-allowed.jpg')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-policy', pol.policy)
        .set('x-authentication-token', pol.token)
        .expect(200)
    })

    return test('Should return a 400 if delete is allowed', async () => {
      // Creation
      let pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'action', 'create']
        ]
      })
      const app = await appFactory()
      await request(app)
        .post('/test/policy/action-restriction/delete-not-allowed.jpg')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-policy', pol.policy)
        .set('x-authentication-token', pol.token)
        .attach('img', pol.file_path)
        .expect(200)
      pol = requestPolicyFileToken('expected/tente.jpg', {
        expiration: '2025-01-01T00:00:00',
        conditions: [
          ['eq', 'action', 'create']
        ]
      })
      await request(app)
        .del('/test/policy/action-restriction/delete-not-allowed.jpg')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-policy', pol.policy)
        .set('x-authentication-token', pol.token)
        .attach('img', pol.file_path)
        .expect(400)
    })
  })
})

// ###
//         BIG IMAGE IN MULTIPART
// ###
// describe 'Upload large file to potentialy generate errors', () ->
//   it 'Should return a 404 not found when retreive the image that doesn\'t exist', (done) ->
//     request app
//       .get '/test/zombies.jpg'
//       .expect 404, (err) ->
//         return done err if err
//         done()

// ###
//         CACHE EVICTION UPDATE FILE MULTIPART
// ###
// describe 'Cache Eviction by updating file in multipart', () ->
//   describe 'POST an image', () ->
//     it 'Should return a 200 OK when adding an image in multipart (cache-eviction-update.jpg)', (done) ->
//       tok = requestMultipartFileToken('expected/igloo.jpg', 'multipart-cache-eviction-update.jpg')
//       request app
//         .post '/test/multipart-cache-eviction-update.jpg'
//         .set 'x-authentication', 'apiaccess'
//         .set 'x-authentication-token', tok.token
//         .attach 'img', tok.file.path
//         .expect 200, (err) ->
//           return done err if err
//           done()

//   describe 'GET: Apply image filter to create cache storage', () ->
//     it 'Should return a 200 OK by changing the igloo', (done) ->
//       request app
//         .get '/test/410x410&/multipart-cache-eviction-update.jpg'
//         .expect 200, (err) ->
//           return done err if err
//           done()

//   describe 'UPDATE the original file (cache-eviction-update.jpg by tente.jpg) to erase the cache', () ->
//     it 'Should return a 200 OK by updating the original image in multipart', (done) ->
//       tok = requestMultipartFileToken('expected/tente.jpg', 'multipart-cache-eviction-update.jpg')
//       request app
//         .put '/test/multipart-cache-eviction-update.jpg'
//         .set 'x-authentication', 'apiaccess'
//         .set 'x-authentication-token', tok.token
//         .attach 'img', tok.file.path
//         .expect 200, (err) ->
//           return done err if err
//           done()

//   describe 'GET: Apply image filter on the tipi and compare hash with the former igloo cached file', () ->
//     it 'Should return the right hash of the image to check if the cache has been erased', (done) ->
//       request app
//         .get '/test/410x410&/multipart-cache-eviction-update.jpg'
//         .end (err, res) ->
//           return done err if err
//           assertResImageEqualFile res, 'expected/410x410_tente.jpg', done
