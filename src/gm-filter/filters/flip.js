
import Filter from './base-filter'

export default class FlipFilter extends Filter {
  isMatching () { return this.option.match(/^flip$/) }
  applyOn (gm) { return gm.flip() }
}
