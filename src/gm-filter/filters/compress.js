
import Filter from './base-filter'

export default class CompressFilter extends Filter {
  constructor () {
    super(...arguments)
    this._match = this.option.match(/^compress\('[A-Za-u]{3,8}?'\)$/)
  }

  isMatching () { return this._match }
  applyOn (gm) {
    return gm.compress(this._match)
  }
}
