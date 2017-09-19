
const Filter = require('./base-filter');

class SepiaFilter extends Filter {
  isMatching() { return this.option.match(/^sepia$/); }
  applyOn(gm) { return gm.sepia(); }
}

module.exports = SepiaFilter;
