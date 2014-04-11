
Filter = require './base-filter'

class BlurFilter extends Filter
  constructor: ->
    super
    @_match = @option.match /^blur\((\d+)(,(\d+))?\)$/
  isMatching: -> @_match
  applyOn: (gm) ->
    # http://www.graphicsmagick.org/GraphicsMagick.html#details-blur
    # blur(radius [, sigma])
    gm.blur(@_match[1], @_match[3])

module.exports = BlurFilter
