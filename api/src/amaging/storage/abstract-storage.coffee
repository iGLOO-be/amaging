
assert = require 'assert'

class AbstractStorage
  @create: (type, options) ->
    Storage = require('./' + type + '-storage')
    storage = new Storage(options)
    return storage

  constructor: (@options) ->

  readInfo: (file, cb) ->
    # {
    #   ContentLength: '159699',
    #   ContentType: 'image/png',
    #   ETag: '"96aa75bb5e8919ad8a60d540d668340d"',
    #   LastModified: 'Mon, 03 Mar 2014 14:29:54 GMT',
    # }
    throw new Error('Not Implemented')

  createReadStream: (file) ->
    throw new Error('Not Implemented')

  requestWriteStream: (file, info, cb) ->
    # info = { 'content-length': '', 'content-type': '' }
    throw new Error('Not Implemented')

  _validWriteInfo: (info) ->
    assert.ok(info.ContentLength, 'ContentLength property is mandatory in write info.')
    assert.ok(info.ContentType, 'ContentType property is mandatory in write info.')

module.exports = AbstractStorage
