
const AbstractFile = require('./abstract-file')

class CacheFile extends AbstractFile {
  static create (storage, filename, cb) {
    const file = new CacheFile(storage, filename)
    file.readInfo(cb)
    return file
  }

  // todo: not fetch info if no options

  _filepath () {
    return this.filename + '/' + this.options.join('_')
  }
}

module.exports = CacheFile
