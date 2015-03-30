
Filter = require './base-filter'

###
Flags:
^:  From doc: http://www.graphicsmagick.org/GraphicsMagick.html#details-resize
    Append a ^ to the geometry so that the image is resized while maintaining
    the aspect ratio of the image, but the resulting width or height are treated
    as minimum values rather than maximum values.
###

class ResizeFilter extends Filter
  constructor: ->
    super
    @_match = @option.match /^(\d+)?(?:x(\d+))?(\^|<|>|!|%|@)*$/
    if @_match
      @_width = @_match[1] and parseInt @_match[1]
      @_height = @_match[2] and parseInt @_match[2]
      @_options = @_match[3]

  isMatching: -> @_match

  applyOn: (gm) ->
    gm.resize @_width, @_height, @_options

module.exports = ResizeFilter
