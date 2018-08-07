
import Filter from './base-filter'

export default class NegativeFilter extends Filter {
  isMatching () { return this.option.match(/^negative$/) }
  applyOn (gm) { return gm.negative() }
}
