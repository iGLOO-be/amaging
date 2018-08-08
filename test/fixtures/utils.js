
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import gm from 'gm'
import tmp from 'tmp'

import chai from 'chai'
const { assert } = chai

export function sha1 (data) {
  return crypto.createHash('sha1')
    .update(data)
    .digest('hex')
}

export function hmacSha1 (data, secret) {
  const sign = crypto.createHmac('sha1', secret)
  sign.update(data)
  return sign.digest('hex').toLowerCase()
}

// Normal upload
export function requestFileToken (filePath, file, contentType) {
  const buffer = fs.readFileSync(path.join(__dirname, '..', filePath))
  const token = sha1([
    'test',
    'apiaccess',
    '4ec2b79b81ee67e305b1eb4329ef2cd1',
    file,
    contentType,
    buffer.length
  ].join(''))
  return {
    access: 'apiaccess',
    buffer,
    token,
    contentType,
    length: buffer.length
  }
}

// Multipart upload
export function requestMultipartFileToken (filePath, file) {
  const token = sha1([
    'test',
    'apiaccess',
    '4ec2b79b81ee67e305b1eb4329ef2cd1',
    file
  ].join(''))
  return {
    access: 'apiaccess',
    file_path: path.join(__dirname, '..', filePath),
    token
  }
}

export function requestJSONToken (data, file) {
  const contentType = 'application/json'
  const buffer = data
  const token = sha1([
    'test',
    'apiaccess',
    '4ec2b79b81ee67e305b1eb4329ef2cd1',
    file,
    contentType,
    buffer.length
  ].join(''))
  return {
    access: 'apiaccess',
    buffer,
    token,
    contentType,
    length: buffer.length
  }
}

export function requestDeleteToken (file) {
  return sha1(`testapiaccess4ec2b79b81ee67e305b1eb4329ef2cd1${file}`)
}

export function requestPolicyFileToken (filePath, policy) {
  policy = encodeBase64(JSON.stringify(policy))
  const token = hmacSha1(policy, '4ec2b79b81ee67e305b1eb4329ef2cd1')
  return {
    access: 'apiaccess',
    file_path: path.join(__dirname, '..', filePath),
    token,
    policy
  }
}

export function encodeBase64 (policy) {
  return Buffer.from(policy, 'utf-8').toString('base64')
}

export function assertResEqualFile (res, filePath) {
  // Testing equality via SHA may randomly produced error.
  // I don't know why SHA are different in some case...
  // But size remains the same, so we switch to length equality.
  const fileBuffer = fs.readFileSync(path.join(__dirname, '..', filePath))
  return assert.equal(parseInt(res.headers['content-length']), fileBuffer.length)
}

// unless Buffer.isBuffer(res.body)
//   body = JSON.stringify(res.body)
// else
//   body = res.body.toString()

// res_sha = utils.sha1(body)
// fileBuffer = fs.readFileSync(path.join(__dirname, '..', filePath))

// file_sha = utils.sha1(fileBuffer.toString())
// assert.equal(res_sha, file_sha)

export function assertResImageEqualFile (res, filePath, done) {
  const expected = path.join(__dirname, '..', filePath)

  return tmp.file(function (err, path, fd, clean) {
    if (err) { return done(err) }

    fs.writeFileSync(path, res.body)
    return gm.compare(expected, path, function (err, isEqual, diff) {
      // clean()
      if (err) { return done(err) }
      if (isEqual) {
        return done()
      } else {
        return done(new Error('Images are not equal.'))
      }
    })
  })
}

export function getServer () {
  return require(process.env.APP_SRV_COVERAGE || '../../src/amaging/server').default
}
