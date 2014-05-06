
{httpError} = require './utils'

class Policy
  contructor: (policy, token) ->
    @policy = policy
    @token = token

  isValid: (policy, token) ->

    console.log 'Policy: ', policy
    console.log 'Token: ', @token

    newPolicy = new Buffer('toto', 'base64')
    unless newPolicy == @token
      return httpError 403, 'Your token is incorrect.'


  get: (key, value) ->



  set: (key) ->


module.exports = Policy