
const Filter = require('./base-filter');

class BorderColorFilter extends Filter {
  constructor() {
    super(...arguments);
    this._match = this.option.match(/^borderColor\(((?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}))\)$/);
  }
  isMatching() { return this._match; }
  applyOn(gm) {
    // http://www.graphicsmagick.org/GraphicsMagick.html#details-bordercolor
    // borderColor(color)
    return gm.bordercolor(`#${this._match[1]}`);
  }
}

module.exports = BorderColorFilter;
