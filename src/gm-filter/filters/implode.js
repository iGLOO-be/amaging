
const Filter = require('./base-filter')

class ImplodeFilter extends Filter {
  constructor () {
    super(...arguments)
    this._match = this.option.match(/^implode\((\d+)\)$/)
  }
  isMatching () { return this._match }
  applyOn (gm) { return gm.implode(this._match[1]) }
}

module.exports = ImplodeFilter
