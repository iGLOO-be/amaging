/* eslint-env jest */

import request from 'supertest'
import chai from 'chai'
import { sign } from '@igloo-be/amaging-policy'
import appFactory from './fixtures/app'

chai.should()

describe('Get/add a folder', () => {
  const addFolder = async (app, path) => {
    await request(app)
      .post(`/test${path}`)
      .set('Authorization', 'Bearer ' + await sign('apiaccess', '4ec2b79b81ee67e305b1eb4329ef2cd1').toJWT())
      .expect(200)
  }

  test('Should return a 200 directory exist', async () => {
    const app = await appFactory()
    await request(app)
      .get('/test/')
      .set('Authorization', 'Bearer ' + await sign('apiaccess', '4ec2b79b81ee67e305b1eb4329ef2cd1').toJWT())
      .expect(200)
  })

  test('Should return a 404 Not Found because directory does not exist', async () => {
    const app = await appFactory()
    await request(app)
      .get('/test/notExist/')
      .set('Authorization', 'Bearer ' + await sign('apiaccess', '4ec2b79b81ee67e305b1eb4329ef2cd1').toJWT())
      .expect(404)
  })

  test('Should return 200 OK by adding a new empty folder', async () => {
    const app = await appFactory()
    await addFolder(app, '/newFolder/')
  })

  test('Should return a 200 OK after adding a new empty folder', async () => {
    const app = await appFactory()
    await addFolder(app, '/newFolder/')
    await request(app)
      .get('/test/newFolder/')
      .set('Authorization', 'Bearer ' + await sign('apiaccess', '4ec2b79b81ee67e305b1eb4329ef2cd1').toJWT())
      .expect(200)
  })

  test('Sould return content-length of 0 because a new directory is empty', async () => {
    const app = await appFactory()
    await addFolder(app, '/newFolder/')
    await request(app)
      .head('/test/newFolder/')
      .set('Authorization', 'Bearer ' + await sign('apiaccess', '4ec2b79b81ee67e305b1eb4329ef2cd1').toJWT())
      .expect('Content-Length', '0')
      .expect(200)
  })

  test('Should return a 200 OK after adding new empty folders recursively', async () => {
    const app = await appFactory()
    await addFolder(app, '/newFolder/newSubFolder/')
    await request(app)
      .get('/test/newFolder/')
      .set('Authorization', 'Bearer ' + await sign('apiaccess', '4ec2b79b81ee67e305b1eb4329ef2cd1').toJWT())
      .expect(200)
    await request(app)
      .get('/test/newFolder/newSubFolder/')
      .set('Authorization', 'Bearer ' + await sign('apiaccess', '4ec2b79b81ee67e305b1eb4329ef2cd1').toJWT())
      .expect(200)
  })

  test('Should return a 404 not found, trying to access a file as a folder, instead of throwing ENOTDIR)', async () => {
    const app = await appFactory()
    await addFolder(app, '/notADir')
    await request(app)
      .get('/test/notADir/')
      .set('Authorization', 'Bearer ' + await sign('apiaccess', '4ec2b79b81ee67e305b1eb4329ef2cd1').toJWT())
      .expect(404)
  })
})
