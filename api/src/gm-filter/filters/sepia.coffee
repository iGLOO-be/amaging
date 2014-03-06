
Filter = require './base-filter'

class SepiaFilter extends Filter
  isMatching: -> @option.match /^sepia$/
  applyOn: (gm) -> gm.sepia()

module.exports = SepiaFilter
