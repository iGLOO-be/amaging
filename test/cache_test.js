/* eslint-env jest */

import request from 'supertest'
import fs from 'fs'
import path from 'path'
import { sign } from '@igloo-be/amaging-policy'

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
        .set('Authorization', 'Bearer ' + await sign('apiaccess', '4ec2b79b81ee67e305b1eb4329ef2cd1').toJWT())
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
      const buffer = fs.readFileSync(path.join(__dirname, 'expected/tipi.jpg'))
      const res2 = await request(app)
        .get('/test/410x410&/cache-eviction-update.jpg')
        .expect(200)
      const originalLength = res2.body.length
      await request(app)
        .post('/test/cache-eviction-update.jpg')
        .type('image/jpeg')
        .set('Content-Length', buffer.length)
        .set('Authorization', 'Bearer ' + await sign('apiaccess', '4ec2b79b81ee67e305b1eb4329ef2cd1').toJWT())
        .send(buffer)
        .expect(200)
      const res = await request(app)
        .get('/test/410x410&/cache-eviction-update.jpg')
        .expect(200)
      expect(res.body.length).not.toEqual(originalLength)
    })
  )
})
