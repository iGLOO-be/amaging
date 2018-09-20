
import AbstractStorage from './abstract-storage'
import path from 'path'
import fs from 'fs-extra'
import sortBy from 'lodash/sortBy'
import File from '../storage/file'

export default class LocalStorage extends AbstractStorage {
  constructor (options, amaging) {
    super(options, amaging)
    this.options = Object.assign({ path: '/' }, this.options)
  }

  async readInfo (file) {
    let stat

    try {
      stat = await fs.stat(this._filepath(file).replace(/\/+$/, ''))
    } catch (err) {
      if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
        throw err
      }
    }

    if (!stat) {
      return null
    }

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
      if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
        console.log('throw ????', err)
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
  }

  async createAsDirectory (filename) {
    await fs.mkdirp(this._filepath(filename))
  }

  async requestReadStream (file) {
    return fs.createReadStream(this._filepath(file))
  }

  async requestWriteStream (file, info) {
    const fileName = this._filepath(file)
    const tmpFileName = fileName + '.tmp.' + require('uuid')()
    const metaFileName = getMetaDataFileName(fileName)

    await fs.mkdirp(path.dirname(fileName))
    const stream = fs.createWriteStream(tmpFileName)

    stream.on('finish', () => {
      try {
        fs.unlinkSync(fileName)
      } catch (err) {}
      fs.moveSync(tmpFileName, fileName)
      fs.writeJSONSync(metaFileName, {
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
