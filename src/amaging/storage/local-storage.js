
import AbstractStorage from './abstract-storage'
import path from 'path'
import fs from 'fs-extra'
import extend from 'lodash/extend'
import sortBy from 'lodash/sortBy'
import File from '../storage/file'

export default class LocalStorage extends AbstractStorage {
  constructor (options) {
    super()
    this.options = extend(
      {path: '/'}
      , options)
  }

  async readInfo (file) {
    try {
      const stat = await fs.stat(this._filepath(file))

      if (stat.isDirectory()) {
        return {
          isDirectory: true,
          ContentType: 'application/x-directory',
          ContentLength: 0,
          ETag: `"0"`,
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
    const dir = await fs.readdir(this._filepath(prefix))
    if (dir && Array.isArray(dir)) {
      const files = await Promise.all(dir.map(file => (
        File.create(
          this,
          path.join(prefix, file)
        )
      )))

      return sortBy(files, file => !file.isDirectory())
    }
    return []
  }

  // Privates

  _filepath (file) {
    return path.join(this.options.path, file)
  }
}
