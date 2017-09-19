
const Filter = require('./base-filter');

class EqualizeFilter extends Filter {
  isMatching() { return this.option.match(/^equalize$/); }
  applyOn(gm) { return gm.equalize(); }
}

module.exports = EqualizeFilter;
