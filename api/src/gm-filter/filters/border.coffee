
Filter = require './base-filter'

class BorderFilter extends Filter
  constructor: ->
    super
    @_match = @option.match /^border\((\d+),(\d+)\)$/
  isMatching: -> @_match
  applyOn: (gm) ->
    # http://www.graphicsmagick.org/GraphicsMagick.html#details-border
    # border(width, height)
    gm.border(@_match[1], @_match[2])

module.exports = BorderFilter
