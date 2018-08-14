/* eslint-env jest */

import request from 'supertest'

import appFactory from './fixtures/app'
let app = null

beforeAll(done => { app = appFactory(done) })

/*
        LIST FILES IN A DIR
*/

describe('GET a file', () => {
  test('Should match snapshot of files in storage', async () => {
    const res = await request(app)
      .get('/test/')
    expect(res.body).toEqual(expect.any(Array))
    res.body.forEach(file => {
      expect(file).toMatchSnapshot({
        LastModified: expect.any(String)
      })
    })
  })

  test('Should return a 404 error because of an unexpected url (access a directory without end slash)', async () => {
    await request(app)
      .get('/test')
      .expect(404)
  })
})
