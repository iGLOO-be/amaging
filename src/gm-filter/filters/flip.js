
const Filter = require('./base-filter')

class FlipFilter extends Filter {
  isMatching () { return this.option.match(/^flip$/) }
  applyOn (gm) { return gm.flip() }
}

module.exports = FlipFilter
