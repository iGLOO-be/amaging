
import Filter from './base-filter'

export default class BlurFilter extends Filter {
  constructor () {
    super(...arguments)
    this._match = this.option.match(/^blur\((\d+)(,(\d+))?\)$/)
  }
  isMatching () { return this._match }
  applyOn (gm) {
    // http://www.graphicsmagick.org/GraphicsMagick.html#details-blur
    // blur(radius [, sigma])
    return gm.blur(this._match[1], this._match[3])
  }
}
