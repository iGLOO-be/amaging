
const gm = require('gm');
const fs = require('fs');

const filters = fs.readdirSync(__dirname + '/filters').map(file => require(`./filters/${file}`));

const filterMatchingOption = function(option) {
  for (let Filter of Array.from(filters)) {
    const filter = new Filter(option);
    if (filter.isMatching()) {
      return filter;
    }
  }
};

class GMFilterEngine {
  constructor() {
    this.addOption = this.addOption.bind(this);
    this._filters = [];
  }

  addOption(option) {
    const filter = filterMatchingOption(option);

    if (filter) {
      return this._filters.push(filter);
    }
  }

  addOptions(options) {
    return options.forEach(this.addOption);
  }

  hasFilters() {
    return this._filters.length > 0;
  }

  runOn(file, cb) {
    const _gm = gm(file);

    this._filters.forEach(filter => filter.applyOn(_gm));

    return _gm.write(file, cb);
  }
}

module.exports = GMFilterEngine;
