
Filter = require './base-filter'

class NegativeFilter extends Filter
  isMatching: -> @option.match /^negative$/
  applyOn: (gm) -> gm.negative()

module.exports = NegativeFilter
