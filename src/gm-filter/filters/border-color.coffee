
Filter = require './base-filter'

class BorderColorFilter extends Filter
  constructor: ->
    super
    @_match = @option.match /^borderColor\(((?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))\)$/
  isMatching: -> @_match
  applyOn: (gm) ->
    # http://www.graphicsmagick.org/GraphicsMagick.html#details-bordercolor
    # borderColor(color)
    gm.bordercolor('#' + @_match[1])

module.exports = BorderColorFilter
