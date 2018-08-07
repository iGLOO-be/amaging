
import Filter from './base-filter'

/*
Flags:
^:  From doc: http://www.graphicsmagick.org/GraphicsMagick.html#details-resize
    Append a ^ to the geometry so that the image is resized while maintaining
    the aspect ratio of the image, but the resulting width or height are treated
    as minimum values rather than maximum values.
*/

export default class ResizeFilter extends Filter {
  constructor () {
    super(...arguments)
    this._match = this.option.match(/^(\d+)?(?:x(\d+))?(\^|<|>|!|%|@)*$/)
    if (this._match) {
      this._width = this._match[1] && parseInt(this._match[1])
      this._height = this._match[2] && parseInt(this._match[2])
      this._options = this._match[3]
    }
  }

  isMatching () { return this._match }

  applyOn (gm) {
    return gm.resize(this._width, this._height, this._options)
  }
}
