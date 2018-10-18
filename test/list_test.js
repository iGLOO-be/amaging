/* eslint-env jest */

import request from 'supertest'
import crypto from 'crypto'

import appFactory from './fixtures/app'

const ACCESS_KEY = 'apiaccess'
const SECRET_KEY = '4ec2b79b81ee67e305b1eb4329ef2cd1'

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

  const listTest = async (path, policyConditions = [], options) => {
    const policy = createPolicy(SECRET_KEY, {
      conditions: policyConditions
    })

    const app = await appFactory(options)
    const res = await request(app)
      .get(`/test${path}`)
      .set('x-authentication', ACCESS_KEY)
      .set('x-authentication-token', policy.token)
      .set('x-authentication-policy', policy.policy)
      .expect(200)
    expect(res.body).toEqual(expect.any(Array))

    expect(res.body.map(file => ({
      ...file,
      LastModified: null,
      ETag: null
    }))).toMatchSnapshot()
  }

  test('Should return a 403 because no auth', async () => {
    const app = await appFactory()
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

    const app = await appFactory()
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

    const app = await appFactory()
    await request(app)
      .get(`/test/foo/bar/`)
      .set('x-authentication', ACCESS_KEY)
      .set('x-authentication-token', policy.token)
      .set('x-authentication-policy', policy.policy)
      .expect(400, 'Invalid value for key: key')
  })

  test('Should list files in storage in root', async () => {
    await listTest('/', [], {
      testFixturesCopy: ['ice.jpg']
    })
  })
  test('Should list files in storage in sub folder', async () => {
    await listTest('/sub-folder/', [], {
      testFixturesCopy: ['sub-folder/ice.jpg']
    })
  })
  test('Should list files when policy allow `list` action', async () => {
    await listTest('/sub-folder/', [
      ['eq', 'action', 'list']
    ], {
      testFixturesCopy: ['sub-folder/ice.jpg']
    })
    await listTest('/sub-folder/', [
      ['eq', 'action', 'list', 'create']
    ], {
      testFixturesCopy: ['sub-folder/ice.jpg']
    })
  })
  test('Should list files when policy allow `key`', async () => {
    await listTest('/sub-folder/', [
      ['eq', 'key', 'sub-folder/']
    ], {
      testFixturesCopy: ['sub-folder/ice.jpg']
    })
  })

  test('Should return a 404 error because of an unexpected url (access a directory without end slash)', async () => {
    const app = await appFactory()
    await request(app)
      .get('/test')
      .expect(404)
  })

  test('Should return a 404 error because of an unexpected url (access a directory without end slash)', async () => {
    const app = await appFactory()
    await request(app)
      .get('/test/a')
      .expect(404)
  })

  test('Should return a 404 error because of an unexpected url (access a directory without end slash)', async () => {
    const app = await appFactory()
    await request(app)
      .get('/test/a/b/a/qsdqsd/qdae/aze')
      .expect(404)
  })
})
