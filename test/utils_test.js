
const chai = require('chai')
chai.should()

const utils = require('../lib/amaging/lib/utils')

describe('utils.cleanAmagingFile', () =>
  it('Must clean ../', function () {
    const str = 'some/../path/../to/../../../../one/resource'
    return utils.cleanAmagingFile(str).should.equal('some/path/to/one/resource')
  })
)
