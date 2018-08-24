/* eslint-env jest */

import { requestMultipartFileToken, assertResImageEqualFilePromise } from './fixtures/utils'
import appFactory from './fixtures/app'
import request from 'supertest'
import chai from 'chai'
chai.should()

let app = null

/*
        ADD IMAGE IN MULTIPART
*/
describe('POST a new image file', () => {
  beforeEach(done => { app = appFactory(done) })

  test(
    'Should return a 404 not found when retreive the image that doesn\'t exist',
    async () => {
      await request(app)
        .get('/test/tente.jpg')
        .expect(404)
    }
  )

  test(
    'Should return a 200 OK when adding an image in multipart (tente.jpg)',
    async () => {
      const tok = requestMultipartFileToken('expected/tente.jpg', 'tente.jpg')
      await request(app)
        .post('/test/tente.jpg')
        .set('x-authentication', tok.access)
        .set('x-authentication-token', tok.token)
        .attach('img', tok.file_path)
        .expect(200)
      const res = await request(app)
        .get('/test/tente.jpg')
        .expect(200)
      await assertResImageEqualFilePromise(res, 'expected/tente.jpg')
    }
  )
})

/*
        BIG IMAGE IN MULTIPART
*/
describe('Upload large file to potentialy generate errors', () => {
  beforeEach(done => { app = appFactory(done) })

  test(
    'Should return a 404 not found when retreive the image that doesn\'t exist',
    async () => {
      await request(app)
        .get('/test/zombies.jpg')
        .expect(404)
    }
  )
})

/*
        CACHE EVICTION UPDATE FILE MULTIPART
*/
describe('Cache Eviction by updating file in multipart', () => {
  beforeEach(done => { app = appFactory(done) })

  describe('POST an image', () =>
    test(
      'Should return a 200 OK when adding an image in multipart (cache-eviction-update.jpg)',
      async () => {
        const tok = requestMultipartFileToken('expected/igloo.jpg', 'multipart-cache-eviction-update.jpg')
        await request(app)
          .post('/test/multipart-cache-eviction-update.jpg')
          .set('x-authentication', 'apiaccess')
          .set('x-authentication-token', tok.token)
          .attach('img', tok.file_path)
          .expect(200)
        await request(app)
          .get('/test/410x410&/multipart-cache-eviction-update.jpg')
          .expect(200)
      }
    )
  )

  describe('UPDATE the original file (cache-eviction-update.jpg by tente.jpg) to erase the cache', () =>
    test(
      'Should return a 200 OK by updating the original image in multipart',
      async () => {
        const tok = requestMultipartFileToken('expected/tente.jpg', 'multipart-cache-eviction-update.jpg')
        await request(app)
          .put('/test/multipart-cache-eviction-update.jpg')
          .set('x-authentication', 'apiaccess')
          .set('x-authentication-token', tok.token)
          .attach('img', tok.file_path)
          .expect(200)
        const res = await request(app)
          .get('/test/410x410&/multipart-cache-eviction-update.jpg')
        await assertResImageEqualFilePromise(res, 'expected/410x410_tente.jpg')
      }
    )
  )
})
