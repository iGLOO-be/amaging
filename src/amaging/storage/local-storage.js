
import AbstractStorage from './abstract-storage'
import path from 'path'
import fs from 'fs-extra'
import sortBy from 'lodash/sortBy'
import File from '../storage/file'

export default class LocalStorage extends AbstractStorage {
  constructor (options, amaging) {
    super(options, amaging)
    this.options = Object.assign({ path: '/' }, options)
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

      const metaData = {}
      try {
        Object.assign(metaData, await fs.readJSON(getMetaDataFileName(this._filepath(file))))
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err
        }
      }

      return {
        isDirectory: false,
        ContentLength: stat.size,
        ETag: `"${stat.size}"`,
        LastModified: stat.mtime,
        ...metaData
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }
  }

  async createAsDirectory (filename) {
    await fs.mkdirp(this._filepath(filename))
  }

  async requestReadStream (file) {
    return fs.createReadStream(this._filepath(file))
  }

  async requestWriteStream (file, info) {
    await fs.mkdirp(path.dirname(this._filepath(file)))
    const stream = fs.createWriteStream(this._filepath(file))

    stream.on('close', () => {
      fs.writeJSON(getMetaDataFileName(this._filepath(file)), {
        ContentType: info.ContentType
      })
    })

    return stream
  }

  async deleteFile (file) {
    return fs.unlink(this._filepath(file))
  }

  async deleteFilesFromPrefix (file) {
    return fs.remove(this._filepath(file))
  }

  async list (prefix) {
    const dirFiles = await fs.readdir(this._filepath(prefix))
    if (dirFiles && Array.isArray(dirFiles)) {
      const files = await Promise.all(dirFiles.filter(file => !isMetaDataFile(file)).map(file => (
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

function isMetaDataFile (file) {
  return file.match(/\.amaging-meta-data$/)
}

function getMetaDataFileName (file) {
  return file + '.amaging-meta-data'
}
