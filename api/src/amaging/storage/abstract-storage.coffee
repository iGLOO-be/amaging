
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

  get: (file) ->
    throw new Error('Not Implemented')

module.exports = AbstractStorage
