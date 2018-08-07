
import Filter from './base-filter'

export default class EqualizeFilter extends Filter {
  isMatching () { return this.option.match(/^equalize$/) }
  applyOn (gm) { return gm.equalize() }
}
