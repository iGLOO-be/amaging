
import Filter from './base-filter'

const conv = {
  northwest: 'NorthWest',
  north: 'North',
  northeast: 'NorthEast',
  west: 'West',
  center: 'Center',
  east: 'East',
  southwest: 'SouthWest',
  south: 'South',
  southeast: 'SouthEast'
}

const reg = /^gravity\((northwest|north|northeast|west|center|east|southwest|south|southeast)\)$/

export default class GravityFilter extends Filter {
  constructor () {
    super(...arguments)
    this._match = this.option.match(reg)
  }
  isMatching () { return this._match }
  applyOn (gm) {
    return gm.gravity(conv[this._match[1]])
  }
}
