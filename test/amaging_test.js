
import request from 'supertest'
import chai from 'chai'
import appFactory from './fixtures/app'

chai.should()

let app = null

const {requestFileToken, requestJSONToken, requestDeleteToken, assertResImageEqualFilePromise} = require('./fixtures/utils')

before(done => { app = appFactory(done) })

/*
        READ
*/
describe('GET a file', function () {
  it('Should return a 404 error because of an unexpected url', async () => {
    await request(app)
      .get('/notExist.png')
      .expect(404)
  })

  it('Should return a 200 OK because the file exist', async () => {
    await request(app)
      .get('/test/igloo.jpg')
      .expect(200)
  })

  it('Should return a 403 error Forbidden because of an non-existing cid', async () => {
    await request(app)
      .get('/notExits/file.png')
      .expect(403)
  })

  it('Should return a 404 not found because the image doesn\'t exist', async () => {
    await request(app)
      .get('/test/file.png')
      .expect(404)
  })

  it('Should return a 404 not found because the file doesn\'t exist', async () => {
    await request(app)
      .get('/test/igloo.json')
      .expect(404)
  })

  return it('Should return a 404 not found because no file specified', async () => {
    await request(app)
      .get('/test/')
      .expect(404)
  })
})

/*
        HEAD
*/
describe('HEAD a file', function () {
  it('Should return a 404 error because the file doesn\'t exist', async () => {
    await request(app)
      .head('/igl00.png')
      .expect(404)
  })

  it('Should return a 200 OK with file info', async () => {
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
describe('POST a new json file and check his Content-Type', function () {
  it('Should return a 404 not found when retreive the file that doesn\'t exist', async () => {
    await request(app)
      .get('/test/notExist.json')
      .expect(404)
  })

  it('Should return a 200 OK by adding a json file', async () => {
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

  it('Should return the json Content-Type and the content of the file.json', async () => {
    await request(app)
      .get('/test/file.json')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Length', '13')
      .expect('Content-Type', 'application/json')
      .expect({
        test: true
      })
  })
})

describe('POST a new image file\n', function () {
  it('Should return a 404 not found when retreive the image that doesn\'t exist', async () => {
    await request(app)
      .get('/test/test.jpg')
      .expect(404)
  })

  it('Should return a 200 OK when adding an image (igloo.jpg)', async () => {
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

  it('Should return a 200 OK when retreive igloo.jpg', async () => {
    const res = await request(app)
      .get('/test/igloo.jpg')
      .expect(200)
    await assertResImageEqualFilePromise(res, 'expected/igloo.jpg')
  })
})

describe('POST : authentication\n', function () {
  it('Should return a 403 error NOT AUTHORIZED because of no token provided', async () => {
    await request(app)
      .post('/test/file.json')
      .type('application/json')
      .set('x-authentication', 'apiaccess')
      .send('{"test_no_token":1}')
      .expect(403)
  })

  it('Should return a 403 error NOT AUTHORIZED because of no api access provided', async () => {
    await request(app)
      .post('/test/file.json')
      .type('application/json')
      .set('x-authentication-token', 'fake-token')
      .send('{"test_no_token":1}')
      .expect(403)
  })

  return it('Should return a 403 error NOT AUTHORIZED because of an altered token', async () => {
    await request(app)
      .post('/test/file.json')
      .type('application/json')
      .set('x-authentication', 'apiaccess')
      .set('x-authentication-token', 'fake-token')
      .send('{"test":1}')
      .expect(403)
  })
})

/*
        DELETE
*/
describe('DELETE files just added\n', function () {
  it('Should return a 200 OK by erasing the image', async () => {
    await request(app)
      .del('/test/delete.jpg')
      .set('x-authentication', 'apiaccess')
      .set('x-authentication-token', requestDeleteToken('delete.jpg'))
      .expect(200)
  })

  it('Should return a 404 not found by erasing the same image AGAIN', async () => {
    await request(app)
      .del('/test/delete.jpg')
      .set('x-authentication', 'apiaccess')
      .set('x-authentication-token', requestDeleteToken('delete.jpg'))
      .expect(404)
  })

  return it('Should return a 404 if getting file', async () => {
    await request(app)
      .get('/test/delete.jpg')
      .expect(404)
  })
})
