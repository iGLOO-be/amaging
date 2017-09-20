
const Filter = require('./base-filter')

class BoxFilter extends Filter {
  constructor () {
    super(...arguments)
    this._match = this.option.match(/^box\((([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))\)$/)
  }
  isMatching () { return this._match }
  applyOn (gm) {
    // http://www.graphicsmagick.org/GraphicsMagick.html#details-box
    // box(color)
    return gm.box(`#${this._match[1]}`)
  }
}

module.exports = BoxFilter
