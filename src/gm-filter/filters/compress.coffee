
Filter = require './base-filter'

class CompressFilter extends Filter
  constructor: ->
    super
    @_match = @option.match /^compress\(\'[A-Za-u]{3,8}?\'\)$/

  isMatching: -> @_match
  applyOn: (gm) ->
    gm.compress(@_match)

module.exports = CompressFilter
