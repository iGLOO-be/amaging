
import assert from 'assert'

export default class AbstractStorage {
  static create (type, options) {
    const Storage = require(`./${type}-storage`).default
    const storage = new Storage(options)
    return storage
  }

  constructor (options) {
    this.options = options
  }

  async readInfo (file) {
    throw new Error('Not Implemented')
  }

  async requestReadStream (file) {
    throw new Error('Not Implemented')
  }

  async requestWriteStream (file, info) {
    throw new Error('Not Implemented')
  }

  async deleteFile (file) {
    throw new Error('Not Implemented')
  }

  async deleteCachedFiles (file) {
    throw new Error('Not Implemented')
  }

  async list (prefix) {
    throw new Error('Not Implemented')
  }

  _validWriteInfo (info) {
    assert.ok(info.ContentLength, 'ContentLength property is mandatory in write info.')
    assert.ok(info.ContentType, 'ContentType property is mandatory in write info.')
  }
}
