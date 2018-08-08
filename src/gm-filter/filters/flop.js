
import Filter from './base-filter'

export default class FlopFilter extends Filter {
  isMatching () { return this.option.match(/^flop$/) }
  applyOn (gm) { return gm.flop() }
}
