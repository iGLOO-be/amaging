
Filter = require './base-filter'

class CropFilter extends Filter
  constructor: ->
    super

    @_match = @option.match /^crop\((\d+)x(\d+)(?:(?:\+(\d+%?))(?:\+(\d+%?)))?\)$/
    if @_match
      @_width = parseInt @_match[1]
      @_height = parseInt @_match[2]
      @_x = @_match[3]
      @_y = @_match[4]

  isMatching: -> @_match

  applyOn: (gm) ->
    gm.crop @_width, @_height, @_x, @_y

module.exports = CropFilter
