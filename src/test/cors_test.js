
const chai = require('chai');
const { assert } = chai;

const request = require('supertest');

const {requestFileToken, requestDeleteToken, assertResEqualFile} = require('./fixtures/utils');
const appFactory = require('./fixtures/app');


/*
        ENABLE CORS
*/

describe('CORS Support', function() {
  it('CORS are not enabled by default', function(done) {
    let app;
    return app = appFactory(function(err) {
      if (err) { return done(err); }
      return request(app)
        .options('/test/some/file')
        .expect(200, function(err, res) {
          if (err) { return done(err); }
          assert.isUndefined(res.headers['access-control-allow-origin']);
          assert.isUndefined(res.headers['access-control-allow-methods']);
          return done(err);
      });
    });
  });

  it('CORS can be enabled with option cors = true', function(done) {
    let app;
    return app = appFactory(
      {cors: true}
    , function(err) {
      if (err) { return done(err); }
      return request(app)
        .options('/test/some/file')
        .expect(204, function(err, res) {
          if (err) { return done(err); }
          assert.equal(res.headers['access-control-allow-origin'], '*');
          assert.equal(res.headers['access-control-allow-methods'], 'GET,HEAD,PUT,PATCH,POST,DELETE');
          return done(err);
      });
    });
  });

  return it('CORS can be enabled with option cors = [empty object]', function(done) {
    let app;
    return app = appFactory(
      {cors: {}}
    , function(err) {
      if (err) { return done(err); }
      return request(app)
        .options('/test/some/file')
        .expect(204, function(err, res) {
          if (err) { return done(err); }
          assert.equal(res.headers['access-control-allow-origin'], '*');
          assert.equal(res.headers['access-control-allow-methods'], 'GET,HEAD,PUT,PATCH,POST,DELETE');
          return done(err);
      });
    });
  });
});
