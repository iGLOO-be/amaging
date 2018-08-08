
import Filter from './base-filter'

export default class SepiaFilter extends Filter {
  isMatching () { return this.option.match(/^sepia$/) }
  applyOn (gm) { return gm.sepia() }
}
