
assert = require 'assert'

class AbstractStorage
  @create: (type, options) ->
    Storage = require('./' + type + '-storage')
    storage = new Storage(options)
    return storage

  constructor: (@options) ->

  readInfo: (file, cb) ->
    throw new Error('Not Implemented')

  createReadStream: (file) ->
    throw new Error('Not Implemented')

  requestWriteStream: (file, info, cb) ->
    throw new Error('Not Implemented')

  deleteFile: (file) ->
    throw new Error('Not Implemented')

  _validWriteInfo: (info) ->
    assert.ok(info.ContentLength, 'ContentLength property is mandatory in write info.')
    assert.ok(info.ContentType, 'ContentType property is mandatory in write info.')

module.exports = AbstractStorage
