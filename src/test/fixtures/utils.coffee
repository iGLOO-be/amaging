
fs = require 'fs'
path = require 'path'
crypto = require 'crypto'
resemble = require('resemble').resemble

chai = require 'chai'
assert = chai.assert

utils =
  sha1: (data) ->
    crypto.createHash('sha1')
      .update(data)
      .digest('hex')

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
    file_open = fs.createReadStream(path.join(__dirname, '..', filePath))
    token = utils.sha1([
      'test',
      'apiaccess',
      '4ec2b79b81ee67e305b1eb4329ef2cd1',
      file
    ].join(''))
    return {
      access: 'apiaccess'
      file: file_open
      token: token
      length: file.length
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


  assertResEqualFile: (res, filePath) ->

    console.log res.headers

    #res_sha = utils.sha1(res.text)

    file_buffer = fs.readFileSync(path.join(__dirname, '..', filePath))
    #console.log 'BUF-LENGTH: ', file_buffer.toString().length

    console.log(res.text.substr(0, 100))

    buff = new Buffer(res.text, 'binary')

    fs.writeFileSync('/tmp/test_buffer_node.jpg', res.text, {
      encoding: null
    })

    resemble(buff).compareTo(file_buffer).onComplete (data) ->
      console.log 'DATA: ', data
      assert.equal(data.misMatchPercentage, '0.00')

    #console.log 'DIFF: ', diff


    # file_sha = utils.sha1(file_buffer.toString())
    # console.log 'RES: ', res_sha
    # console.log 'FILE: ', file_sha
    # assert.equal(res_sha, file_sha)

  getServer: ->
    return require(process.env.APP_SRV_COVERAGE || '../../amaging/server')

module.exports = utils
