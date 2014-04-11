
gm = require 'gm'
fs = require 'fs'

filters = fs.readdirSync(__dirname + '/filters').map (file) ->
  require './filters/' + file

filterMatchingOption = (option) ->
  for Filter in filters
    filter = new Filter option
    if filter.isMatching()
      return filter
  return

class GMFilterEngine
  constructor: ->
    @_filters = []

  addOption: (option) =>
    filter = filterMatchingOption option

    if filter
      @_filters.push filter

  addOptions: (options) ->
    options.forEach @addOption

  hasFilters: ->
    @_filters.length > 0

  runOn: (file, cb) ->
    _gm = gm(file)

    @_filters.forEach (filter) ->
      filter.applyOn _gm

    _gm.write(file, cb)

module.exports = GMFilterEngine
