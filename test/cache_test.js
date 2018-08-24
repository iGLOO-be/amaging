/* eslint-env jest */

import request from 'supertest'

import { requestFileToken, requestDeleteToken, assertResImageEqualFilePromise } from './fixtures/utils'
import appFactory from './fixtures/app'

/*
        CACHE EVICTION DELETE FILE
*/

describe('Cache Eviction by deleting file', () => {
  test(
    'Should return a 200 OK when retreive cache-eviction-delete.jpg',
    async () => {
      const app = await appFactory()
      await request(app)
        .get('/test/cache-eviction-delete.jpg')
        .expect(200)
    }
  )

  describe('GET: Apply image filter to create cache storage', () => {
    test('Should return a 200 OK by bluring the image', async () => {
      const app = await appFactory()
      await request(app)
        .get('/test/blur(10,2)&/cache-eviction-delete.jpg')
        .expect(200)
    })

    return test('Should return a 200 OK by resizing the image', async () => {
      const app = await appFactory()
      await request(app)
        .get('/test/100x100&/cache-eviction-delete.jpg')
        .expect(200)
    })
  })

  describe('DELETE the original file (cache-eviction-delete.jpg) to erase the cache', () =>
    test('Should return a 200 OK by erasing the original image', async () => {
      const app = await appFactory()
      await request(app)
        .del('/test/cache-eviction-delete.jpg')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-token', requestDeleteToken('cache-eviction-delete.jpg'))
        .expect(200)
      await request(app)
        .get('/test/blur(8,2)&/cache-eviction-delete.jpg')
        .expect(404)
    })
  )
})

/*
        CACHE EVICTION UPDATE FILE
*/

describe('Cache Eviction by updating file', () => {
  describe('POST an image', () =>
    test(
      'Should return a 200 OK when adding an image (cache-eviction-update.jpg)',
      async () => {
        const app = await appFactory()
        const tok = requestFileToken('expected/igloo.jpg', 'cache-eviction-update.jpg', 'image/jpeg')
        await request(app)
          .post('/test/cache-eviction-update.jpg')
          .type(tok.contentType)
          .set('Content-Length', tok.length)
          .set('x-authentication', 'apiaccess')
          .set('x-authentication-token', tok.token)
          .send(tok.buffer)
          .expect(200)
      }
    )
  )

  describe('GET: Apply image filter to create cache storage', () =>
    test('Should return a 200 OK by changing the igloo', async () => {
      const app = await appFactory()
      await request(app)
        .get('/test/410x410&/cache-eviction-update.jpg')
        .expect(200)
    })
  )

  describe('UPDATE the original file (cache-eviction-update.jpg by tipi.jpg) to erase the cache', () =>
    test('Should return a 200 OK by updating the original image', async () => {
      const app = await appFactory()
      const tok = requestFileToken('expected/tipi.jpg', 'cache-eviction-update.jpg', 'image/jpeg')
      await request(app)
        .post('/test/cache-eviction-update.jpg')
        .type(tok.contentType)
        .set('Content-Length', tok.length)
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-token', tok.token)
        .send(tok.buffer)
        .expect(200)
      const res = await request(app)
        .get('/test/410x410&/cache-eviction-update.jpg')
        .expect(200)
      await assertResImageEqualFilePromise(res, 'expected/410x410_tipi.jpg')
    })
  )
})
