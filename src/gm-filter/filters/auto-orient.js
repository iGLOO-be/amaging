
import Filter from './base-filter'

export default class AutoOrient extends Filter {
  constructor () {
    super(...arguments)
    this._match = this.option.match(/^autoOrient$/)
  }
  isMatching () { return this._match }
  applyOn (gm) {
    return gm.autoOrient()
  }
}
