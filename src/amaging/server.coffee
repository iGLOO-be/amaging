
express = require 'express'
cors = require 'cors'
Boom = require 'boom'
_ = require 'lodash'
amagingFactory = require './amaging'

module.exports = (options) ->
  app = express(options)
  amaging = amagingFactory(options)

  app.set('port', options.port || process.env.PORT || 3000)
  app.disable('x-powered-by')

  if options.cors
    app.use(cors(
      if _.isObject(options.cors)
        options.cors
      else
        {}
    ))

  # Routes
  app.head('/:cid/*', amaging.head)
  app.get('/:cid/*', amaging.read)

  app.post('/:cid/*', amaging.write)
  app.put('/:cid/*', amaging.write)

  app.delete('/:cid/*', amaging.delete)

  # Error handling
  app.use (err, req, res, next) ->
    return next err unless err.name == 'PolicyError'
    next new Boom.badRequest(err.message)

  app.use (err, req, res, next) ->
    return next err unless err.isBoom
    res.status err.output.statusCode
    res.format
      'text/plain': -> res.send err.message
      'text/html': -> res.send err.message
      'application/json': -> res.send err.output.payload


  return app