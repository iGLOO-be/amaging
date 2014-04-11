
Filter = require './base-filter'

class BoxFilter extends Filter
  constructor: ->
    super
    @_match = @option.match /^box\((([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))\)$/
  isMatching: -> @_match
  applyOn: (gm) ->
    # http://www.graphicsmagick.org/GraphicsMagick.html#details-box
    # box(color)
    gm.box('#' + @_match[1])

module.exports = BoxFilter
