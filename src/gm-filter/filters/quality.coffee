
Filter = require './base-filter'

class QualityFilter extends Filter
  constructor: ->
    super
    @_match = @option.match /^quality\((\d+)\)$/
    if @_match
      @_quality = parseInt @_match[1]

  isMatching: -> @_match
  applyOn: (gm) ->
    gm.quality(@_quality)

module.exports = QualityFilter