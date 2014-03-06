
Filter = require './base-filter'

class ImplodeFilter extends Filter
  constructor: ->
    super
    @_match = @option.match /^implode\((\d+)\)$/
  isMatching: -> @_match
  applyOn: (gm) -> gm.implode(@_match[1])

module.exports = ImplodeFilter
