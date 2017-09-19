
const chai = require('chai');
const { assert } = chai;
chai.should();

const utils = require('../amaging/lib/utils');


describe('utils.cleanAmagingFile', () =>
  it('Must clean ../', function() {
    const str = 'some/../path/../to/../../../../one/resource';
    return utils.cleanAmagingFile(str).should.equal('some/path/to/one/resource');
  })
);




