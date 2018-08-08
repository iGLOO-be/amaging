
import Filter from './base-filter'

export default class ImplodeFilter extends Filter {
  constructor () {
    super(...arguments)
    this._match = this.option.match(/^implode\((\d+)\)$/)
  }
  isMatching () { return this._match }
  applyOn (gm) { return gm.implode(this._match[1]) }
}
