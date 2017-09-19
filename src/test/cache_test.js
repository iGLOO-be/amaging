
const request = require('supertest');

const {requestFileToken, requestDeleteToken, assertResImageEqualFile} = require('./fixtures/utils');
const appFactory = require('./fixtures/app');
let app = null;


before(done => app = appFactory(done));


/*
        CACHE EVICTION DELETE FILE
*/

describe('Cache Eviction by deleting file', function() {
  it('Should return a 200 OK when retreive cache-eviction-delete.jpg', function(done) {
    request(app)
      .get('/test/cache-eviction-delete.jpg')
      .expect(200, done);
  });

  describe('GET: Apply image filter to create cache storage', function() {
    it('Should return a 200 OK by bluring the image', function(done) {
      request(app)
        .get('/test/blur(10,2)&/cache-eviction-delete.jpg')
        .expect(200, function(err) {
          if (err) { return done(err); }
          return done();
      });
    });

    return it('Should return a 200 OK by resizing the image', function(done) {
      request(app)
        .get('/test/100x100&/cache-eviction-delete.jpg')
        .expect(200, function(err) {
          if (err) { return done(err); }
          return done();
      });
    });
  });

  describe('DELETE the original file (cache-eviction-delete.jpg) to erase the cache', () =>
    it('Should return a 200 OK by erasing the original image', function(done) {
      request(app)
        .del('/test/cache-eviction-delete.jpg')
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-token', requestDeleteToken('cache-eviction-delete.jpg'))
        .expect(200, function(err) {
          if (err) { return done(err); }
          return done();
      });
    })
  );

  return describe('GET: Try to apply other changes to the file just erased', () =>
    it('Should return a 404 not found because the image has been deleted', function(done) {
      request(app)
        .get('/test/blur(8,2)&/cache-eviction-delete.jpg')
        .expect(404, function(err) {
          if (err) { return done(err); }
          return done();
      });
    })
  );
});

/*
        CACHE EVICTION UPDATE FILE
*/

describe('Cache Eviction by updating file', function() {
  describe('POST an image', () =>
    it('Should return a 200 OK when adding an image (cache-eviction-update.jpg)', function(done) {
      const tok = requestFileToken('expected/igloo.jpg', 'cache-eviction-update.jpg', 'image/jpeg');
      request(app)
        .post('/test/cache-eviction-update.jpg')
        .type(tok.contentType)
        .set('Content-Length', tok.length)
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-token', tok.token)
        .send(tok.buffer)
        .expect(200, function(err) {
          if (err) { return done(err); }
          return done();
      });
    })
  );

  describe('GET: Apply image filter to create cache storage', () =>
    it('Should return a 200 OK by changing the igloo', function(done) {
      request(app)
        .get('/test/410x410&/cache-eviction-update.jpg')
        .expect(200, function(err) {
          if (err) { return done(err); }
          return done();
      });
    })
  );

  describe('UPDATE the original file (cache-eviction-update.jpg by tipi.jpg) to erase the cache', () =>
    it('Should return a 200 OK by updating the original image', function(done) {
      const tok = requestFileToken('expected/tipi.jpg', 'cache-eviction-update.jpg', 'image/jpeg');
      request(app)
        .post('/test/cache-eviction-update.jpg')
        .type(tok.contentType)
        .set('Content-Length', tok.length)
        .set('x-authentication', 'apiaccess')
        .set('x-authentication-token', tok.token)
        .send(tok.buffer)
        .expect(200, function(err) {
          if (err) { return done(err); }
          return done();
      });
    })
  );

  return describe('GET: Apply image filter on the tipi and compare hash with the former igloo cached file', () =>
    it('Should return the right hash of the image to check if the cache has been erased', function(done) {
      request(app)
        .get('/test/410x410&/cache-eviction-update.jpg')
        .end(function(err, res) {
          if (err) { return done(err); }
          return assertResImageEqualFile(res, 'expected/410x410_tipi.jpg', done);
      });
    })
  );
});
