
const AbstractFile = require('./abstract-file')

const async = require('async')

class File extends AbstractFile {
  static create (storage, cacheStorage, filename, cb) {
    const file = new File(storage, cacheStorage, filename)
    file.readInfo(cb)
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
      }, // result @ is to avoid coffeelint alert "no_unnecessary_fat_arrows"
      done => {
        return this.deleteCachedFiles(done)
      }
    ], err => cb(err, stream))
  }

  deleteFile (cb) {
    return super.deleteFile(err => {
      if (err) { return cb(err) }
      return this.deleteCachedFiles(cb)
    })
  }

  deleteCachedFiles (cb) {
    return this.cacheStorage.deleteCachedFiles(this._filepath(), cb)
  }
}

module.exports = File
