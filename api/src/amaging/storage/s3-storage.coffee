
AbstractStorage = require './abstract-storage'

class S3Storage extends AbstractStorage
  constructor: (@options) ->

module.exports = S3Storage
