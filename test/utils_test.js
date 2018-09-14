/* eslint-env jest */

import { Policy } from '@igloo-be/amaging-policy'
import { cleanAmagingFile, findMaxSizeFromPolicy } from '../src/amaging/lib/utils'
import chai from 'chai'
chai.should()

describe('utils.cleanAmagingFile', () =>
  test('Must clean ../', () => {
    const str = 'some/../path/../to/../../../../one/resource'
    cleanAmagingFile(str).should.equal('some/path/to/one/resource')
  })
)

describe('utils.findMaxSizeFromPolicy', () => {
  test('Must works', () => {
    expect(findMaxSizeFromPolicy(new Policy({
      conditions: [
        ['eq', 'foo', 'bar']
      ]
    }))).toEqual(Infinity)

    expect(findMaxSizeFromPolicy(new Policy({
      conditions: [
        ['eq', 'Content-Length', 10]
      ]
    }))).toEqual(10)

    // Max
    expect(findMaxSizeFromPolicy(new Policy({
      conditions: [
        ['eq', 'Content-Length', 5]
      ]
    }), 5)).toEqual(5)

    expect(findMaxSizeFromPolicy(new Policy({
      conditions: [
        ['range', 'Content-Length', 0, 10]
      ]
    }))).toEqual(10)

    // Max
    expect(findMaxSizeFromPolicy(new Policy({
      conditions: [
        ['range', 'Content-Length', 0, 10]
      ]
    }), 5)).toEqual(5)
  })
})
