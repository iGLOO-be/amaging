
Filter = require './base-filter'

class EqualizeFilter extends Filter
  isMatching: -> @option.match /^equalize$/
  applyOn: (gm) -> gm.equalize()

module.exports = EqualizeFilter
