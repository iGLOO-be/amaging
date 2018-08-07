
import Filter from './base-filter'

export default class BackgroundFilter extends Filter {
  constructor () {
    super(...arguments)
    this._match = this.option.match(/^background\(((?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))\)$/)
  }
  isMatching () { return this._match }
  applyOn (gm) {
    // http://www.graphicsmagick.org/GraphicsMagick.html#details-background
    // background(color)
    return gm.background(`#${this._match[1]}`)
  }
}
