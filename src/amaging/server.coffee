
express = require 'express'
cors = require 'cors'
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

  return app