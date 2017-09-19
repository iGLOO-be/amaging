
const AbstractFile = require('./abstract-file');

const fs = require('fs');
const async = require('async');

class File extends AbstractFile {
  static create(storage, cacheStorage, filename, cb) {
    const file = new File(storage, cacheStorage, filename);
    file.readInfo(cb);
    return file;
  }

  constructor(storage, cacheStorage, filename) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { this; }).toString();
      let thisName = thisFn.slice(thisFn.indexOf('{') + 1, thisFn.indexOf(';')).trim();
      eval(`${thisName} = this;`);
    }
    this.cacheStorage = cacheStorage;
    super(storage, filename);
  }

  requestWriteStream(info, cb) {
    let stream = null;

    return async.series([
      done => {
        return File.prototype.__proto__.requestWriteStream.call(this, info, (err, _stream) => {
          stream = _stream;
          return done(err, this);
        });
      }, // result @ is to avoid coffeelint alert "no_unnecessary_fat_arrows"
      done => {
        return this.deleteCachedFiles(done);
      }
    ], err => cb(err, stream));
  }

  deleteFile(cb) {
    return super.deleteFile(err => {
      if (err) { return cb(err); }
      return this.deleteCachedFiles(cb);
    });
  }

  deleteCachedFiles(cb) {
    return this.cacheStorage.deleteCachedFiles(this._filepath(), cb);
  }
}

module.exports = File;