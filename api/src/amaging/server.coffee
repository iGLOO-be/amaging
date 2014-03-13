
express = require 'express'
amagingFactory = require './amaging'

module.exports = (options) ->
  app = express(options)
  amaging = amagingFactory(options)

  app.set('port', 3000)

  # Routes
  app.get('/:cid/*', amaging.read)

  app.post('/:cid/*', amaging.write)
  app.put('/:cid/*', amaging.write)

  app.delete('/:cid/*', amaging.delete)

  return app
