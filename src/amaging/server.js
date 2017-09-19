
const express = require('express');
const cors = require('cors');
const Boom = require('boom');
const _ = require('lodash');
const amagingFactory = require('./amaging');

module.exports = function(options) {
  const app = express(options);
  const amaging = amagingFactory(options);

  app.set('port', options.port || process.env.PORT || 3000);
  app.disable('x-powered-by');

  if (options.cors) {
    app.use(cors(
      _.isObject(options.cors) ?
        options.cors
      :
        {}
    ));
  }

  // Routes
  app.head('/:cid/*', amaging.head);
  app.get('/:cid/*', amaging.read);

  app.post('/:cid/*', amaging.write);
  app.put('/:cid/*', amaging.write);

  app.delete('/:cid/*', amaging.delete);

  // Error handling
  app.use(function(err, req, res, next) {
    if (err.name !== 'PolicyError') { return next(err); }
    const boomErr = new Boom.badRequest(err.message, err.data);
    boomErr.output.payload.data = err.data || {};
    boomErr.output.payload.data.type = err.type;
    return next(boomErr);
  });

  app.use(function(err, req, res, next) {
    if (!err.isBoom) { return next(err); }
    res.status(err.output.statusCode);
    return res.format({
      'text/plain'() { return res.send(err.message); },
      'text/html'() { return res.send(err.message); },
      'application/json'() { return res.send(err.output.payload); }
    });
  });


  return app;
};