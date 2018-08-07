
import Filter from './base-filter'

export default class CropFilter extends Filter {
  constructor () {
    super(...arguments)

    this._match = this.option.match(/^crop\((\d+)x(\d+)(?:(?:\+(\d+%?))(?:\+(\d+%?)))?\)$/)
    if (this._match) {
      this._width = parseInt(this._match[1])
      this._height = parseInt(this._match[2])
      this._x = this._match[3]
      this._y = this._match[4]
    }
  }

  isMatching () { return this._match }

  applyOn (gm) {
    return gm.crop(this._width, this._height, this._x, this._y)
  }
}
