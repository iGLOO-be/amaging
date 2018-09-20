
import gm from 'gm'
import fs from 'fs'
import path from 'path'

const filters = fs.readdirSync(path.join(__dirname, '/filters')).map(file => require(`./filters/${file}`).default)
const filterMatchingOption = function (option) {
  for (let Filter of Array.from(filters)) {
    const filter = new Filter(option)
    if (filter.isMatching()) {
      return filter
    }
  }
}

export default class GMFilterEngine {
  constructor () {
    this.addOption = this.addOption.bind(this)
    this._filters = []
  }

  static isValidOption (options) {
    return options.filter(o => filterMatchingOption(o))
  }

  addOption (option) {
    const filter = filterMatchingOption(option)

    if (filter) {
      return this._filters.push(filter)
    }
  }

  addOptions (options) {
    return options.forEach(this.addOption)
  }

  hasFilters () {
    return this._filters.length > 0
  }

  async runOn (file) {
    const _gm = gm(file)

    this._filters.forEach(filter => filter.applyOn(_gm))

    return new Promise((resolve, reject) => {
      _gm.write(file, (err, res) => {
        if (err) reject(err)
        else resolve(res)
      })
    })
  }
}
