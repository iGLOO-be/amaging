
import AbstractStorage from './abstract-storage'
import path from 'path'
import fs from 'fs-extra'
import extend from 'lodash/extend'

export default class LocalStorage extends AbstractStorage {
  constructor (options) {
    super()
    this.options = extend(
      {path: '/'}
      , options)
  }

  async readInfo (file, cb) {
    try {
      const stat = await fs.stat(this._filepath(file))
      return {
        ContentLength: stat.size,
        ETag: `"${stat.size}"`,
        LastModified: stat.mtime
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
  }

  async requestReadStream (file) {
    return fs.createReadStream(this._filepath(file))
  }

  async requestWriteStream (file, info) {
    await fs.mkdirp(path.dirname(this._filepath(file)))
    return fs.createWriteStream(this._filepath(file))
  }

  async deleteFile (file) {
    return fs.unlink(this._filepath(file))
  }

  async deleteCachedFiles (file) {
    return fs.remove(this._filepath(file))
  }

  // Privates

  _filepath (file) {
    return path.join(this.options.path, file)
  }
}
