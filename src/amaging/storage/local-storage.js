
import AbstractStorage from './abstract-storage'
import path from 'path'
import fs from 'fs-extra'
import mkdirp from 'mkdirp'
import extend from 'lodash/extend'
import rimraf from 'rimraf'

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

  requestReadStream (file, cb) {
    return cb(null, fs.createReadStream(this._filepath(file)))
  }

  requestWriteStream (file, info, cb) {
    return mkdirp(path.dirname(this._filepath(file)), err => {
      if (err) { return cb(err) }
      return cb(null, this.createWriteStream(file))
    })
  }

  createWriteStream (file) {
    return fs.createWriteStream(this._filepath(file))
  }

  deleteFile (file, cb) {
    return fs.unlink(this._filepath(file), cb)
  }

  deleteCachedFiles (file, cb) {
    return rimraf(this._filepath(file), cb)
  }

  // Privates

  _filepath (file) {
    return path.join(this.options.path, file)
  }
}

module.exports = LocalStorage
