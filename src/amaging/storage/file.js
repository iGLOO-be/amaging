
import AbstractFile from './abstract-file'

import async from 'async'

export default class File extends AbstractFile {
  static async create (storage, cacheStorage, filename) {
    const file = new File(storage, cacheStorage, filename)
    await file.readInfo()
    return file
  }

  constructor (storage, cacheStorage, filename) {
    super(storage, filename)
    this.cacheStorage = cacheStorage
  }

  requestWriteStream (info, cb) {
    let stream = null

    return async.series([
      done => {
        return AbstractFile.prototype.requestWriteStream.call(this, info, (err, _stream) => {
          stream = _stream
          return done(err, this)
        })
      },
      done => {
        this.deleteCachedFiles()
          .then(v => done(null, v))
          .catch(err => done(err))
      }
    ], err => cb(err, stream))
  }

  async deleteFile () {
    await super.deleteFile()
    await this.deleteCachedFiles()
  }

  async deleteCachedFiles () {
    return this.cacheStorage.deleteCachedFiles(this._filepath())
  }
}
