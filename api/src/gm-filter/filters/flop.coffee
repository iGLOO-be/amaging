
Filter = require './base-filter'

class FlopFilter extends Filter
  isMatching: -> @option.match /^flop$/
  applyOn: (gm) -> gm.flop()

module.exports = FlopFilter
