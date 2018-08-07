
import Filter from './base-filter'

export default class QualityFilter extends Filter {
  constructor () {
    super(...arguments)
    this._match = this.option.match(/^quality\((\d+)\)$/)
    if (this._match) {
      this._quality = parseInt(this._match[1])
    }
  }

  isMatching () { return this._match }
  applyOn (gm) {
    return gm.quality(this._quality)
  }
}
