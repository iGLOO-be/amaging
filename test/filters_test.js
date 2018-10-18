/* eslint-env jest */

import request from 'supertest'

import { assertResEqualFile, assertResImageEqualFilePromise } from './fixtures/utils'
import appFactory from './fixtures/app'

describe('GET : Play with image filters', () => {
  test('Should return a 200 OK by modifying the image', async () => {
    const app = await appFactory({
      testFixturesCopy: ['igloo.jpg']
    })
    const res = await request(app)
      .get('/test/blur(5,2)&/igloo.jpg')
      .expect(200)
    await assertResImageEqualFilePromise(res, 'expected/blur(5,2)_igloo.jpg')
  })

  test('Should return a 200 OK by using an unknown filter', async () => {
    const app = await appFactory({
      testFixturesCopy: ['igloo.jpg']
    })
    await request(app)
      .get('/test/unknown&/igloo.jpg')
      .expect(200)
  })

  return test(
    'Should return 200 OK by using a filter on a non image file',
    async () => {
      const app = await appFactory({
        testFixturesCopy: ['file.json']
      })
      const res = await request(app)
        .get('/test/196&/file.json')
        .expect(200)
      await assertResEqualFile(res, 'expected/file.json')
    }
  )
})
