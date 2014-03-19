
Filter = require './base-filter'

class ResizeFilter extends Filter
  constructor: ->
    super
    @_match = @option.match /^(\d+)(?:x(\d+))?(<|>|!|%|@)?$/
    if @_match
      @_width = parseInt @_match[1]
      @_height = @_match[2] and parseInt @_match[2]
      @_options = @_match[3]

  isMatching: -> @_match

  applyOn: (gm) ->
    gm.resize @_width, @_height, @_options

module.exports = ResizeFilter
