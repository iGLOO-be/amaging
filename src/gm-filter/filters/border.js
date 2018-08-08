
import Filter from './base-filter'

export default class BorderFilter extends Filter {
  constructor () {
    super(...arguments)
    this._match = this.option.match(/^border\((\d+),(\d+)\)$/)
  }
  isMatching () { return this._match }
  applyOn (gm) {
    // http://www.graphicsmagick.org/GraphicsMagick.html#details-border
    // border(width, height)
    return gm.border(this._match[1], this._match[2])
  }
}
