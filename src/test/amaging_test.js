
const chai = require('chai');
const { assert } = chai;
const { expect } = chai;
chai.should();


const request = require('supertest');

const {requestFileToken, requestJSONToken, requestDeleteToken, assertResImageEqualFile} = require('./fixtures/utils');
const appFactory = require('./fixtures/app');
let app = null;


before(done => app = appFactory(done));


/*
        READ
*/
describe('GET a file\n', function() {
  it('Should return a 404 error because of an unexpected url', function(done) {
    request(app)
      .get('/notExist.png')
      .expect(404, done);
  });

  it('Should return a 200 OK because the file exist', function(done) {
    request(app)
      .get('/test/igloo.jpg')
      .expect(200, done);
  });

  it('Should return a 403 error Forbidden because of an non-existing cid', function(done) {
    request(app)
      .get('/notExits/file.png')
      .expect(403, done);
  });

  it('Should return a 404 not found because the image doesn\'t exist', function(done) {
    request(app)
      .get('/test/file.png')
      .expect(404, done);
  });

  it('Should return a 404 not found because the file doesn\'t exist', function(done) {
    request(app)
      .get('/test/igloo.json')
      .expect(404, done);
  });

  return it('Should return a 404 not found because no file specified', function(done) {
    request(app)
      .get('/test/')
      .expect(404, done);
  });
});

/*
        HEAD
*/
describe('HEAD a file\n', function() {
  it('Should return a 404 error because the file doesn\'t exist', function(done) {
    request(app)
      .head('/igl00.png')
      .expect(404, done);
  });

  return it('Should return a 200 OK with file info', function(done) {
    request(app)
      .head('/test/igloo.jpg')
      .expect(200)
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res.headers['content-length']).to.be.equals('17252');
        expect(res.headers['content-type']).to.be.equals('image/jpeg');
        return done();
    });
  });
});

/*
        WRITE
*/
describe('POST a new json file and check his Content-Type\n', function() {
  it('Should return a 404 not found when retreive the file that doesn\'t exist', function(done) {
    request(app)
      .get('/test/notExist.json')
      .expect(404, function(err) {
        if (err) { return done(err); }
        return done();
    });
  });

  it('Should return a 200 OK by adding a json file', function(done) {
    const tok = requestJSONToken(JSON.stringify({
      test: true
    }), 'file.json');
    request(app)
      .post('/test/file.json')
      .type(tok.contentType)
      .set('x-authentication', tok.access)
      .set('x-authentication-token', tok.token)
      .send(tok.buffer)
      .expect(200, function(err) {
        if (err) { return done(err); }
        return done();
    });
  });

  return it('Should return the json Content-Type and the content of the file.json', function(done) {
    request(app)
      .get('/test/file.json')
      .set('Accept', 'application/json')
      .end(function(err, res) {
        if (err) { return done(err); }
        assert.equal(res.text, JSON.stringify({
          test: true
        }));
        assert.equal(res.headers['content-length'], '13');
        assert.equal(res.headers['content-type'], 'application/json');
        return done();
    });
  });
});


describe('POST a new image file\n', function() {
  it('Should return a 404 not found when retreive the image that doesn\'t exist', function(done) {
    request(app)
      .get('/test/test.jpg')
      .expect(404, function(err) {
        if (err) { return done(err); }
        return done();
    });
  });

  it('Should return a 200 OK when adding an image (igloo.jpg)', function(done) {
    const tok = requestFileToken('expected/igloo.jpg', 'igloo.jpg', 'image/jpeg');
    request(app)
      .post('/test/igloo.jpg')
      .type(tok.contentType)
      .set('Content-Length', tok.length)
      .set('x-authentication', tok.access)
      .set('x-authentication-token', tok.token)
      .send(tok.buffer)
      .expect(200, function(err) {
        if (err) { return done(err); }
        return done();
    });
  });

  return it('Should return a 200 OK when retreive igloo.jpg', function(done) {
    request(app)
      .get('/test/igloo.jpg')
      .expect(200)
      .end(function(err, res) {
        if (err) { return done(err); }
        return assertResImageEqualFile(res, 'expected/igloo.jpg', done);
    });
  });
});


describe('POST : authentication\n', function() {
  it('Should return a 403 error NOT AUTHORIZED because of no token provided', function(done) {
    request(app)
      .post('/test/file.json')
      .type('application/json')
      .set('x-authentication', 'apiaccess')
      .send("{\"test_no_token\":1}")
      .expect(403, function(err) {
        if (err) { return done(err); }
        return done();
    });
  });

  it('Should return a 403 error NOT AUTHORIZED because of no api access provided', function(done) {
    request(app)
      .post('/test/file.json')
      .type('application/json')
      .set('x-authentication-token', 'fake-token')
      .send("{\"test_no_token\":1}")
      .expect(403, function(err) {
        if (err) { return done(err); }
        return done();
    });
  });

  return it('Should return a 403 error NOT AUTHORIZED because of an altered token', function(done) {
    request(app)
      .post('/test/file.json')
      .type('application/json')
      .set('x-authentication', 'apiaccess')
      .set('x-authentication-token', 'fake-token')
      .send("{\"test\":1}")
      .expect(403, function(err) {
        if (err) { return done(err); }
        return done();
    });
  });
});


/*
        DELETE
*/
describe('DELETE files just added\n', function() {
  it('Should return a 200 OK by erasing the image', function(done) {
    request(app)
      .del('/test/delete.jpg')
      .set('x-authentication', 'apiaccess')
      .set('x-authentication-token', requestDeleteToken('delete.jpg'))
      .expect(200, function(err) {
        if (err) { return done(err); }
        return done();
    });
  });

  it('Should return a 404 not found by erasing the same image AGAIN', function(done) {
    request(app)
      .del('/test/delete.jpg')
      .set('x-authentication', 'apiaccess')
      .set('x-authentication-token', requestDeleteToken('delete.jpg'))
      .expect(404, function(err) {
        if (err) { return done(err); }
        return done();
    });
  });

  return it('Should return a 404 if getting file', function(done) {
    request(app)
      .get('/test/delete.jpg')
      .expect(404, function(err) {
        if (err) { return done(err); }
        return done();
    });
  });
});
