/* eslint-env jest */

import request from 'supertest'

import appFactory from './fixtures/app'

import chai from 'chai'
const { assert } = chai

/*
        ENABLE CORS
*/

describe('CORS Support', () => {
  test('CORS are not enabled by default', async () => {
    const app = await appFactory()
    const res = await request(app)
      .options('/test/some/file')
      .expect(200)
    assert.isUndefined(res.headers['access-control-allow-origin'])
    assert.isUndefined(res.headers['access-control-allow-methods'])
  })

  test('CORS can be enabled with option cors = true', async () => {
    const app = await appFactory({cors: true})
    const res = await request(app)
      .options('/test/some/file')
      .expect(204)
    assert.equal(res.headers['access-control-allow-origin'], '*')
    assert.equal(res.headers['access-control-allow-methods'], 'GET,HEAD,PUT,PATCH,POST,DELETE')
  })

  test('CORS can be enabled with option cors = [empty object]', async () => {
    const app = await appFactory({cors: {}})
    const res = await request(app)
      .options('/test/some/file')
      .expect(204)
    assert.equal(res.headers['access-control-allow-origin'], '*')
    assert.equal(res.headers['access-control-allow-methods'], 'GET,HEAD,PUT,PATCH,POST,DELETE')
  })
})
