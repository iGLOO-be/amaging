
Filter = require './base-filter'

class BlurFilter extends Filter
  constructor: ->
    super
    @_match = @option.match /^autoOrient$/
  isMatching: -> @_match
  applyOn: (gm) ->
    gm.autoOrient()

module.exports = BlurFilter
