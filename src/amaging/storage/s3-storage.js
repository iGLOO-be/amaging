
const AbstractStorage = require('./abstract-storage');

const debug = require('debug')('amaging:storage:s3');

const async = require('async');
const path = require('path');
const _ = require('lodash');
const knox = require('knox');
const Boom = require('boom');


const InvalidResponse = (method, response) =>
  Boom.create(500, `Invalid ${method.toUpperCase()} response from S3. (Status: ${response.statusCode})`,
    {response})
;

class S3Storage extends AbstractStorage {
  constructor(options) {
    super();
    this.options = options;
    this._S3_knox = new knox.createClient({
      key: this.options.key,
      secret: this.options.secret,
      region: this.options.region,
      bucket: this.options.bucket
    });
  }

  readInfo(file, cb) {
    debug('Start reading info for "%s"', file);

    return this._S3_knox.headFile(this._filepath(file), function(err, res) {
      if (err) { return cb(err); }
      if (res.statusCode === 404) { return cb(); }
      if (res.statusCode !== 200) { return cb(InvalidResponse('head', res)); }

      return cb(null, {
        ContentType: res.headers['content-type'],
        ContentLength: res.headers['content-length'],
        ETag: res.headers['etag'],
        LastModified: res.headers['last-modified']
      });
  });
  }

  requestReadStream(file, cb) {
    debug('Create readStream for "%s"', file);
    return this._S3_knox.getFile(this._filepath(file), (err, s3Res) => cb(err, s3Res));
  }

  requestWriteStream(file, info, cb) {
    this._validWriteInfo(info);

    const headers = {
      'content-type': info.ContentType,
      'content-length': info.ContentLength
    };

    const stream = this._S3_knox.put(this._filepath(file), headers);

    stream.on('response', function(res) {
      if (res.statusCode !== 200) {
        return stream.emit('error', InvalidResponse('put', res));
      }
    });

    return cb(null, stream);
  }

  deleteFile(file, cb) {
    return this._S3_knox.deleteFile(this._filepath(file), cb);
  }

  deleteCachedFiles(file, cb) {
    let keys = null;
    return async.series([
      done => {
        debug('Begin listing keys');

        return this._S3_knox.list({ prefix: this._filepath(file) }, function(err, _keys) {
          keys = _keys;
          return done(err);
        });
      },
      done => {
        debug('Proceed to delete');
        if (!__guard__(keys != null ? keys.Contents : undefined, x => x.length)) {
          return done();
        }

        return this._S3_knox.deleteMultiple(keys != null ? keys.Contents.map(k => k.Key) : undefined, (err, res) => done(err));
      }
    ], cb);
  }

  _filepath(file) {
    return path.join(this.options.path, file);
  }
}

module.exports = S3Storage;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}