
import AbstractStorage from './abstract-storage'
import path from 'path'
import fs from 'fs'
import mkdirp from 'mkdirp'
import _ from 'lodash'
import rimraf from 'rimraf'

export default class LocalStorage extends AbstractStorage {
  constructor (options) {
    super()
    this.options = _.extend(
      {path: '/'}
      , options)
  }

  readInfo (file, cb) {
    return fs.stat(this._filepath(file), function (err, stat) {
      if (err && (err.code !== 'ENOENT')) {
        return cb(err)
      }

      if (!stat) {
        return cb()
      }

      return cb(null, {
        ContentLength: stat.size,
        ETag: `"${stat.size}"`,
        LastModified: stat.mtime
      }
      )
    })
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
