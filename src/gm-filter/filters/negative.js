
const Filter = require('./base-filter');

class NegativeFilter extends Filter {
  isMatching() { return this.option.match(/^negative$/); }
  applyOn(gm) { return gm.negative(); }
}

module.exports = NegativeFilter;
