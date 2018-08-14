
import AbstractStorage from './abstract-storage'
import path from 'path'
import fs from 'fs-extra'
import extend from 'lodash/extend'
import File from '../storage/file'

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

      if (stat.isDirectory()) {
        return {
          isDirectory: true,
          ContentType: 'application/x-directory',
          ContentLength: 0,
          ETag: `"${0}"`,
          LastModified: stat.mtime
        }
      }

      return {
        isDirectory: false,
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

  async deleteFilesFromPrefix (file) {
    return fs.remove(this._filepath(file))
  }

  async list (prefix) {
    const files = await fs.readdir(this._filepath(prefix))
    if (files && Array.isArray(files)) {
      return Promise.all(files.map(file => (
        File.create(
          this,
          null,
          file
        )
      )))
    }
    return []
  }

  // Privates

  _filepath (file) {
    return path.join(this.options.path, file)
  }
}
