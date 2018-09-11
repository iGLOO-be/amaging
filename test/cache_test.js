/* eslint-env jest */

import request from 'supertest'

import { requestFileToken, requestDeleteToken, assertResImageEqualFilePromise } from './fixtures/utils'
import appFactory from './fixtures/app'

/*
        CACHE EVICTION DELETE FILE
*/

describe('Cache Eviction by deleting file', () => {
  describe('DELETE the original file (cache-eviction-delete.jpg) to erase the cache', () =>
    test('Should return a 200 OK by erasing the original image', async () => {
      const app = await appFactory()
      await request(app)
        .get('/test/cache-eviction-delete.jpg')
        .expect(200)
      await request(app)
        .get('/test/blur(8,2)&/cache-eviction-delete.jpg')
        .expect(200)
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
  describe('UPDATE the original file (cache-eviction-update.jpg by tipi.jpg) to erase the cache', () =>
    test('Should return a 200 OK by updating the original image', async () => {
      const app = await appFactory()
      const tok = requestFileToken('expected/tipi.jpg', 'cache-eviction-update.jpg', 'image/jpeg')
      await request(app)
        .get('/test/410x410&/cache-eviction-update.jpg')
        .expect(200)
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
