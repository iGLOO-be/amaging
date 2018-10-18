
import gm from 'gm'

import autoOrient from './filters/auto-orient'
import background from './filters/background'
import blur from './filters/blur'
import borderColor from './filters/border-color'
import border from './filters/border'
import box from './filters/box'
import compress from './filters/compress'
import crop from './filters/crop'
import equalize from './filters/equalize'
import extent from './filters/extent'
import flip from './filters/flip'
import flop from './filters/flop'
import gravity from './filters/gravity'
import implode from './filters/implode'
import negative from './filters/negative'
import quality from './filters/quality'
import resize from './filters/resize'
import sepia from './filters/sepia'

const filters = [
  autoOrient,
  background,
  blur,
  borderColor,
  border,
  box,
  compress,
  crop,
  equalize,
  extent,
  flip,
  flop,
  gravity,
  implode,
  negative,
  quality,
  resize,
  sepia
]
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

  static filterValidOptions (options) {
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
