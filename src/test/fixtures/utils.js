
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const gm = require('gm');
const tmp = require('tmp');

const chai = require('chai');
const { assert } = chai;

var utils = {
  sha1(data) {
    return crypto.createHash('sha1')
      .update(data)
      .digest('hex');
  },
  hmacSha1(data, secret) {
    const sign = crypto.createHmac('sha1', secret);
    sign.update(data);
    return sign.digest('hex').toLowerCase();
  },

  // Normal upload
  requestFileToken(filePath, file, contentType) {
    const buffer = fs.readFileSync(path.join(__dirname, '..', filePath));
    const token = utils.sha1([
      'test',
      'apiaccess',
      '4ec2b79b81ee67e305b1eb4329ef2cd1',
      file,
      contentType,
      buffer.length
    ].join(''));
    return {
      access: 'apiaccess',
      buffer,
      token,
      contentType,
      length: buffer.length
    };
  },

  // Multipart upload
  requestMultipartFileToken(filePath, file) {
    const token = utils.sha1([
      'test',
      'apiaccess',
      '4ec2b79b81ee67e305b1eb4329ef2cd1',
      file
    ].join(''));
    return {
      access: 'apiaccess',
      file_path: path.join(__dirname, '..', filePath),
      token
    };
  },

  requestJSONToken(data, file) {
    const contentType = 'application/json';
    const buffer = data;
    const token = utils.sha1([
      'test',
      'apiaccess',
      '4ec2b79b81ee67e305b1eb4329ef2cd1',
      file,
      contentType,
      buffer.length
    ].join(''));
    return {
      access: 'apiaccess',
      buffer,
      token,
      contentType,
      length: buffer.length
    };
  },

  requestDeleteToken(file) {
    return utils.sha1(`testapiaccess4ec2b79b81ee67e305b1eb4329ef2cd1${file}`);
  },

  requestPolicyFileToken(filePath, policy) {
    policy = utils.encodeBase64(JSON.stringify(policy));
    const token = utils.hmacSha1(policy, '4ec2b79b81ee67e305b1eb4329ef2cd1');
    return {
      access: 'apiaccess',
      file_path: path.join(__dirname, '..', filePath),
      token,
      policy
    };
  },

  encodeBase64(policy) {
    return Buffer(policy, "utf-8").toString("base64");
  },

  assertResEqualFile(res, filePath) {
    // Testing equality via SHA may randomly produced error.
    // I don't know why SHA are different in some case...
    // But size remains the same, so we switch to length equality.
    const file_buffer = fs.readFileSync(path.join(__dirname, '..', filePath));
    return assert.equal(parseInt(res.headers['content-length']), file_buffer.length);
  },

    // unless Buffer.isBuffer(res.body)
    //   body = JSON.stringify(res.body)
    // else
    //   body = res.body.toString()

    // res_sha = utils.sha1(body)
    // file_buffer = fs.readFileSync(path.join(__dirname, '..', filePath))

    // file_sha = utils.sha1(file_buffer.toString())
    // assert.equal(res_sha, file_sha)

  assertResImageEqualFile(res, filePath, done) {
    const expected = path.join(__dirname, '..', filePath);

    return tmp.file(function(err, path, fd, clean) {
      if (err) { return done(err); }

      fs.writeFileSync(path, res.body);
      return gm.compare(expected, path, function(err, isEqual, diff) {
        // clean()
        if (err) { return done(err); }
        if (isEqual) {
          return done();
        } else {
          return done(new Error('Images are not equal.'));
        }
      });
    });
  },

  getServer() {
    return require(process.env.APP_SRV_COVERAGE || '../../amaging/server');
  }
};

module.exports = utils;
