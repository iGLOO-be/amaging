
const Filter = require('./base-filter');

class FlopFilter extends Filter {
  isMatching() { return this.option.match(/^flop$/); }
  applyOn(gm) { return gm.flop(); }
}

module.exports = FlopFilter;
