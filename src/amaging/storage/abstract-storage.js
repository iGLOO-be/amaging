
import assert from 'assert'

export default class AbstractStorage {
  static create (type, options) {
    const Storage = require(`./${type}-storage`)
    const storage = new Storage(options)
    return storage
  }

  constructor (options) {
    this.options = options
  }

  readInfo (file, cb) {
    throw new Error('Not Implemented')
  }

  requestReadStream (file, cb) {
    throw new Error('Not Implemented')
  }

  requestWriteStream (file, info, cb) {
    throw new Error('Not Implemented')
  }

  deleteFile (file) {
    throw new Error('Not Implemented')
  }

  deleteCachedFiles (file, cb) {
    throw new Error('Not Implemented')
  }

  _validWriteInfo (info) {
    assert.ok(info.ContentLength, 'ContentLength property is mandatory in write info.')
    return assert.ok(info.ContentType, 'ContentType property is mandatory in write info.')
  }
}
