
import { cleanAmagingFile } from '../src/amaging/lib/utils'
import chai from 'chai'
chai.should()

describe('utils.cleanAmagingFile', () =>
  it('Must clean ../', function () {
    const str = 'some/../path/../to/../../../../one/resource'
    return cleanAmagingFile(str).should.equal('some/path/to/one/resource')
  })
)
