/* eslint-env jest */

import request from 'supertest'
import chai from 'chai'
import { sign } from '@igloo-be/amaging-policy'
import appFactory from './fixtures/app'

chai.should()

const {requestFileToken, requestJSONToken, requestDeleteToken, expectRequestToMatchSnapshot} = require('./fixtures/utils')

/*
        READ
*/
describe('GET a file', () => {
  test('Should return a 404 error because of an unexpected url', async () => {
    const app = await appFactory()
    await request(app)
      .get('/notExist.png')
      .expect(404)
  })

  test('Should return a 200 OK because the file exist', async () => {
    const app = await appFactory()
    await request(app)
      .get('/test/igloo.jpg')
      .expect(200)
  })

  test(
    'Should return a 403 error Forbidden because of an non-existing cid',
    async () => {
      const app = await appFactory()
      await request(app)
        .get('/notExits/file.png')
        .expect(403)
    }
  )

  test(
    'Should return a 404 not found because the image doesn\'t exist',
    async () => {
      const app = await appFactory()
      await request(app)
        .get('/test/file.png')
        .expect(404)
    }
  )

  test(
    'Should return a 404 not found because the file doesn\'t exist',
    async () => {
      const app = await appFactory()
      await request(app)
        .get('/test/igloo.json')
        .expect(404)
    }
  )
})

/*
        HEAD
*/
describe('HEAD a file', () => {
  test('Should return a 404 error because the file doesn\'t exist', async () => {
    const app = await appFactory()
    await request(app)
      .head('/igl00.png')
      .expect(404)
  })

  test('Should return a 200 OK with file info', async () => {
    const app = await appFactory()
    await request(app)
      .head('/test/igloo.jpg')
      .expect(200)
      .expect('Content-Length', '17252')
      .expect('Content-Type', 'image/jpeg')
  })
})

/*
        WRITE
*/
describe('POST a new json file and check his Content-Type', () => {
  test(
    'Should return a 404 not found when retreive the file that doesn\'t exist',
    async () => {
      const app = await appFactory()
      await request(app)
        .get('/test/notExist.json')
        .expect(404)
    }
  )

  test('Should return a 200 OK by adding a json file', async () => {
    const app = await appFactory()
    const tok = requestJSONToken(JSON.stringify({
      test: true
    }), 'file.json')
    await request(app)
      .post('/test/file.json')
      .type(tok.contentType)
      .set('x-authentication', tok.access)
      .set('x-authentication-token', tok.token)
      .send(tok.buffer)
      .expect(200)
  })

  test('Should return a 200 OK by adding a json file with a JWT token', async () => {
    const app = await appFactory()
    const data = { test: true }
    const filePath = '/test/file.notajsonext'
    await request(app)
      .post(filePath)
      .type('application/json')
      .set('Authorization', 'Bearer ' + await sign('apiaccess', '4ec2b79b81ee67e305b1eb4329ef2cd1').toJWT())
      .send(JSON.stringify(data))
      .expect(200)

    const res = await request(app).get(filePath).expect(200)
    expect(res.body).toEqual(data)
    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8')
  })

  test('Should return a 403 with an expired token', async () => {
    const app = await appFactory()
    const data = { test: true }
    const filePath = '/test/expired-token.json'
    expectRequestToMatchSnapshot(
      await request(app)
        .post(filePath)
        .type('application/json')
        .set('Authorization', 'Bearer ' + await sign('apiaccess', '4ec2b79b81ee67e305b1eb4329ef2cd1').expiresIn(-1).toJWT())
        .set('Accept', 'application/json')
        .send(JSON.stringify(data))
        .expect(403)
    )
    await request(app).get(filePath).expect(404)
  })

  test('Should return a 403 with an invalid secret', async () => {
    const app = await appFactory()
    const data = { test: true }
    const filePath = '/test/bad-secret.json'
    expectRequestToMatchSnapshot(
      await request(app)
        .post(filePath)
        .type('application/json')
        .set('Authorization', 'Bearer ' + await sign('apiaccess', 'bad-secret').toJWT())
        .set('Accept', 'application/json')
        .send(JSON.stringify(data))
        .expect(403)
    )
    await request(app).get(filePath).expect(404)
  })

  test('Should return a 403 with an invalid access key', async () => {
    const app = await appFactory()
    const data = { test: true }
    const filePath = '/test/bad-access-key.json'
    expectRequestToMatchSnapshot(
      await request(app)
        .post(filePath)
        .type('application/json')
        .set('Authorization', 'Bearer ' + await sign('unkown', '4ec2b79b81ee67e305b1eb4329ef2cd1').toJWT())
        .set('Accept', 'application/json')
        .send(JSON.stringify(data))
        .expect(403)
    )
    await request(app).get(filePath).expect(404)
  })

  describe('Should return a 403 with an invalid conditions', () => {
    test('Invalid key', async () => {
      const app = await appFactory()
      const data = { test: true }
      const filePath = '/test/bad-access-key.json'
      expectRequestToMatchSnapshot(
        await request(app)
          .post(filePath)
          .type('application/json')
          .set('Authorization', 'Bearer ' + await sign('apiaccess', '4ec2b79b81ee67e305b1eb4329ef2cd1')
            .cond('eq', 'key', '1234')
            .toJWT()
          )
          .set('Accept', 'application/json')
          .send(JSON.stringify(data))
          .expect(400)
      )
      await request(app).get(filePath).expect(404)
    })
    test('Invalid content-type', async () => {
      const app = await appFactory()
      const data = { test: true }
      const filePath = '/test/bad.json'
      expectRequestToMatchSnapshot(
        await request(app)
          .post(filePath)
          .type('application/json')
          .set('Authorization', 'Bearer ' + await sign('apiaccess', '4ec2b79b81ee67e305b1eb4329ef2cd1')
            .cond('starts-with', 'content-type', 'image/')
            .toJWT()
          )
          .set('Accept', 'application/json')
          .send(JSON.stringify(data))
          .expect(400)
      )
      await request(app).get(filePath).expect(404)
    })
  })

  test(
    'Should return the json Content-Type and the content of the file.json',
    async () => {
      const app = await appFactory()
      await request(app)
        .get('/test/file.json')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Length', '13')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({
          test: true
        })
    }
  )
  describe('Options: writer.maxSize', () => {
    test('Should error when body is too large', async () => {
      const app = await appFactory({
        writer: {
          maxSize: 3
        }
      })
      const data = { test: true }
      const filePath = '/test/body-too-large.json'
      expectRequestToMatchSnapshot(
        await request(app)
          .post(filePath)
          .type('application/json')
          .set('Authorization', 'Bearer ' + await sign('apiaccess', '4ec2b79b81ee67e305b1eb4329ef2cd1')
            .toJWT()
          )
          .set('Accept', 'application/json')
          .send(JSON.stringify(data))
          .expect(413)
      )
      await request(app).get(filePath).expect(404)
    })
  })

  test('Should return the json Content-Type and the content of the file.json', async () => {
    const app = await appFactory()
    await request(app)
      .get('/test/file.json')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Length', '13')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect({
        test: true
      })
  })
})

describe('POST a new image file\n', () => {
  test(
    'Should return a 404 not found when retreive the image that doesn\'t exist',
    async () => {
      const app = await appFactory()
      await request(app)
        .get('/test/test.jpg')
        .expect(404)
    }
  )

  test('Should return a 200 OK when add an image', async () => {
    const app = await appFactory()
    const tok = requestFileToken('expected/igloo.jpg', 'some-new-image.jpg', 'image/jpeg')
    await request(app)
      .post('/test/some-new-image.jpg')
      .type(tok.contentType)
      .set('Content-Length', tok.length)
      .set('x-authentication', tok.access)
      .set('x-authentication-token', tok.token)
      .send(tok.buffer)
      .expect(200)
  })

  test('Should return a 200 OK when overwrite an image', async () => {
    const app = await appFactory()
    const tok = requestFileToken('expected/igloo.jpg', 'igloo.jpg', 'image/jpeg')
    await request(app)
      .post('/test/igloo.jpg')
      .type(tok.contentType)
      .set('Content-Length', tok.length)
      .set('x-authentication', tok.access)
      .set('x-authentication-token', tok.token)
      .send(tok.buffer)
      .expect(200)
  })

  test('Should return a 200 OK when add an unkown-type file', async () => {
    const app = await appFactory()
    const tok = requestFileToken('fixtures/storage/some-file-with-unknown-ext.ozo', 'some-new-file-with-unkown-ext.zoz', 'application/octet-stream')
    await request(app)
      .post('/test/some-new-file-with-unkown-ext.zoz')
      .type(tok.contentType)
      .set('Content-Length', tok.length)
      .set('x-authentication', tok.access)
      .set('x-authentication-token', tok.token)
      .send(tok.buffer)
      .expect(200)
  })
})

describe('POST : authentication\n', () => {
  test(
    'Should return a 403 error NOT AUTHORIZED because of no token provided',
    async () => {
      const app = await appFactory()
      await request(app)
        .post('/test/file.json')
        .type('application/json')
        .set('x-authentication', 'apiaccess')
        .send('{"test_no_token":1}')
        .expect(403)
    }
  )

  test(
    'Should return a 403 error NOT AUTHORIZED because of no api access provided',
    async () => {
      const app = await appFactory()
      await request(app)
        .post('/test/file.json')
        .type('application/json')
        .set('x-authentication-token', 'fake-token')
        .send('{"test_no_token":1}')
        .expect(403)
    }
  )

  test(
    'Should return a 403 error NOT AUTHORIZED because of an altered token',
    async () => {
      const app = await appFactory()
      await request(app)
        .post('/test/file.json')
        .type('application/json')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-token', 'fake-token')
        .send('{"test":1}')
        .expect(403)
    }
  )
})

/*
        DELETE
*/
describe('DELETE files just added\n', () => {
  test('Should return a 200 OK by erasing the image', async () => {
    const app = await appFactory()
    await request(app)
      .del('/test/delete.jpg')
      .set('x-authentication', 'apiaccess')
      .set('x-authentication-token', requestDeleteToken('delete.jpg'))
      .expect(200)
    await request(app)
      .del('/test/delete.jpg')
      .set('x-authentication', 'apiaccess')
      .set('x-authentication-token', requestDeleteToken('delete.jpg'))
      .expect(404)
  })
})
