
const Filter = require('./base-filter')

class BlurFilter extends Filter {
  constructor () {
    super(...arguments)
    this._match = this.option.match(/^autoOrient$/)
  }
  isMatching () { return this._match }
  applyOn (gm) {
    return gm.autoOrient()
  }
}

module.exports = BlurFilter
