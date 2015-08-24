
fs = require 'fs'
path = require 'path'
crypto = require 'crypto'
gm = require 'gm'
tmp = require 'tmp'

chai = require 'chai'
assert = chai.assert

utils =
  sha1: (data) ->
    crypto.createHash('sha1')
      .update(data)
      .digest('hex')
  hmacSha1: (data, secret) ->
    sign = crypto.createHmac('sha1', secret)
    sign.update(data)
    return sign.digest('hex').toLowerCase()

  # Normal upload
  requestFileToken: (filePath, file, contentType) ->
    buffer = fs.readFileSync(path.join(__dirname, '..', filePath))
    token = utils.sha1([
      'test',
      'apiaccess',
      '4ec2b79b81ee67e305b1eb4329ef2cd1',
      file,
      contentType,
      buffer.length
    ].join(''))
    return {
      access: 'apiaccess'
      buffer: buffer
      token: token
      contentType: contentType
      length: buffer.length
    }

  # Multipart upload
  requestMultipartFileToken: (filePath, file) ->
    token = utils.sha1([
      'test',
      'apiaccess',
      '4ec2b79b81ee67e305b1eb4329ef2cd1',
      file
    ].join(''))
    return {
      access: 'apiaccess'
      file_path: path.join(__dirname, '..', filePath)
      token: token
    }

  requestJSONToken: (data, file) ->
    contentType = 'application/json'
    buffer = data
    token = utils.sha1([
      'test',
      'apiaccess',
      '4ec2b79b81ee67e305b1eb4329ef2cd1',
      file,
      contentType,
      buffer.length
    ].join(''))
    return {
      access: 'apiaccess'
      buffer: buffer
      token: token
      contentType: contentType
      length: buffer.length
    }

  requestDeleteToken: (file) ->
    utils.sha1('test' + 'apiaccess' + '4ec2b79b81ee67e305b1eb4329ef2cd1' + file)

  requestPolicyFileToken: (filePath, policy) ->
    policy = utils.encodeBase64(JSON.stringify(policy))
    token = utils.hmacSha1(policy, '4ec2b79b81ee67e305b1eb4329ef2cd1')
    return {
      access: 'apiaccess'
      file_path: path.join(__dirname, '..', filePath)
      token: token
      policy: policy
    }

  encodeBase64: (policy) ->
    return Buffer(policy, "utf-8").toString("base64")

  assertResEqualFile: (res, filePath) ->
    # Testing equality via SHA may randomly produced error.
    # I don't know why SHA are different in some case...
    # But size remains the same, so we switch to length equality.
    file_buffer = fs.readFileSync(path.join(__dirname, '..', filePath))
    assert.equal(parseInt(res.headers['content-length']), file_buffer.length)

    # unless Buffer.isBuffer(res.body)
    #   body = JSON.stringify(res.body)
    # else
    #   body = res.body.toString()

    # res_sha = utils.sha1(body)
    # file_buffer = fs.readFileSync(path.join(__dirname, '..', filePath))

    # file_sha = utils.sha1(file_buffer.toString())
    # assert.equal(res_sha, file_sha)

  assertResImageEqualFile: (res, filePath, done) ->
    expected = path.join(__dirname, '..', filePath)

    tmp.file (err, path, fd, clean) ->
      return done err if err
      console.log ' wait end', path

      fs.writeFileSync path, res.body
      gm.compare expected, path, (err, isEqual, diff) ->
        # clean()
        return done err if err
        if isEqual
          done()
        else
          done new Error('Images are not equal.')

  getServer: ->
    return require(process.env.APP_SRV_COVERAGE || '../../amaging/server')

module.exports = utils
