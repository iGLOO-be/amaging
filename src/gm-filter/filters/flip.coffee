
Filter = require './base-filter'

class FlipFilter extends Filter
  isMatching: -> @option.match /^flip$/
  applyOn: (gm) -> gm.flip()

module.exports = FlipFilter
