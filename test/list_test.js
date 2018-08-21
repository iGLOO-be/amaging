/* eslint-env jest */

import request from 'supertest'
import crypto from 'crypto'

import appFactory from './fixtures/app'
let app = null

const ACCESS_KEY = 'apiaccess'
const SECRET_KEY = '4ec2b79b81ee67e305b1eb4329ef2cd1'

beforeAll(done => { app = appFactory(done) })

/*
        LIST FILES IN A DIR
*/

describe('GET a file', () => {
  const createPolicy = (secret, data) => {
    data.expiration = new Date(new Date().getTime() + 1000 * 60)
    const policy = Buffer.from(JSON.stringify(data)).toString('base64')

    const sign = crypto.createHmac('sha1', secret)
    sign.update(policy)
    const token = sign.digest('hex').toLowerCase()

    return {
      policy,
      token
    }
  }

  const listTest = async (path, policyConditions = []) => {
    const policy = createPolicy(SECRET_KEY, {
      conditions: policyConditions
    })

    const res = await request(app)
      .get(`/test${path}`)
      .set('x-authentication', ACCESS_KEY)
      .set('x-authentication-token', policy.token)
      .set('x-authentication-policy', policy.policy)
      .expect(200)
    expect(res.body).toEqual(expect.any(Array))
    res.body.forEach(file => {
      expect(file).toMatchSnapshot({
        LastModified: expect.any(String)
      })
    })
  }

  test('Should return a 403 because no auth', async () => {
    await request(app)
      .get(`/test/`)
      .expect(403)
  })
  test('Should return a 400 when policy does not allow `list` action', async () => {
    const policy = createPolicy(SECRET_KEY, {
      conditions: [
        ['eq', 'action', 'foo']
      ]
    })

    await request(app)
      .get(`/test/foo/bar/`)
      .set('x-authentication', ACCESS_KEY)
      .set('x-authentication-token', policy.token)
      .set('x-authentication-policy', policy.policy)
      .expect(400, 'Invalid value for key: action')
  })
  test('Should return a 400 when policy does not allow `key`', async () => {
    const policy = createPolicy(SECRET_KEY, {
      conditions: [
        ['eq', 'key', 'foo']
      ]
    })

    await request(app)
      .get(`/test/foo/bar/`)
      .set('x-authentication', ACCESS_KEY)
      .set('x-authentication-token', policy.token)
      .set('x-authentication-policy', policy.policy)
      .expect(400, 'Invalid value for key: key')
  })

  test('Should list files in storage in root', async () => {
    await listTest('/')
  })
  test('Should list files in storage in sub folder', async () => {
    await listTest('/sub-folder/')
  })
  test('Should list files when policy allow `list` action', async () => {
    await listTest('/sub-folder/', [
      ['eq', 'action', 'list']
    ])
    await listTest('/sub-folder/', [
      ['eq', 'action', 'list', 'create']
    ])
  })
  test('Should list files when policy allow `key`', async () => {
    await listTest('/sub-folder/', [
      ['eq', 'key', 'sub-folder/']
    ])
  })

  test('Should return a 404 error because of an unexpected url (access a directory without end slash)', async () => {
    await request(app)
      .get('/test')
      .expect(404)
  })

  test('Should return a 404 error because of an unexpected url (access a directory without end slash)', async () => {
    await request(app)
      .get('/test/a')
      .expect(404)
  })
})
