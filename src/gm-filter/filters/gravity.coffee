
Filter = require './base-filter'

conv =
  northwest: 'NorthWest'
  north: 'North'
  northeast: 'NorthEast'
  west: 'West'
  center: 'Center'
  east: 'East'
  southwest: 'SouthWest'
  south: 'South'
  southeast: 'SouthEast'

reg = /^gravity\((northwest|north|northeast|west|center|east|southwest|south|southeast)\)$/

class GravityFilter extends Filter
  constructor: ->
    super
    @_match = @option.match reg
  isMatching: -> @_match
  applyOn: (gm) ->
    gm.gravity(conv[@_match[1]])

module.exports = GravityFilter
