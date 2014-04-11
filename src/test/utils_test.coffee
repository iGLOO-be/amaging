
chai = require 'chai'
assert = chai.assert
chai.should()

utils = require '../amaging/lib/utils'


describe 'utils.cleanAmagingFile', ->
  it 'Must clean ../', ->
    str = 'some/../path/../to/../../../../one/resource'
    utils.cleanAmagingFile(str).should.equal('some/path/to/one/resource')




