
Filter = require './base-filter'

class BackgroundFilter extends Filter
  constructor: ->
    super
    @_match = @option.match /^background\(((?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))\)$/
  isMatching: -> @_match
  applyOn: (gm) ->
    # http://www.graphicsmagick.org/GraphicsMagick.html#details-background
    # background(color)
    gm.background('#' + @_match[1])

module.exports = BackgroundFilter
