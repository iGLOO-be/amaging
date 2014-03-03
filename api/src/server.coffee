
express = require 'express'
amaging = require './amaging/amaging'

module.exports = (options) ->
  app = express(options)
  amaging = amaging(options)

  app.set('port', 3000)

  # Routes
  app.get('/:uid/:file', amaging.read)

  app.post('/:uid/:file', amaging.write)
  app.put('/:uid/:file', amaging.write)

  return app
