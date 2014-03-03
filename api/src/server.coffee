
express = require 'express'
amaging = require './amaging/amaging'

module.exports = (options) ->
  app = express(options)
  amaging = amaging(options)

  app.set('port', 3000)

  # Routes
  app.get('/:cid/*', amaging.read)

  app.post('/:cid/*', amaging.write)
  app.put('/:cid/*', amaging.write)

  return app
