// put tests for the server.js file here
var server = require('./server');
var assert = require('assert');
var superagent = require('superagent');

// test going to the main site page returns an HTTP status code of 200

describe('serv', function() {
  var serv;

  beforeEach(function() {
    serv = server().listen(3000);
  });

  afterEach(function() {
    serv.close();
  });

  it('returns and HTTP status code of 200 when user goes to /', function (done) {
    superagent.get('http://localhost:3000/', function (error, res) {
      assert.ifError(error);
      assert.equal(res.status, 200);
      done();
    });
  });
/*
  it('prints out "Page for user USERNAME with option undefined" when user goes to /user/USERNAME', function (done) {
    superagent.get('http://localhost:3000/user/USERNAME', function (error, res) {
      assert.ifError(error);
      assert.equal(res.status, 200);
      assert.equal(res.text, "Page for user USERNAME with option undefined");
      // Page for user ' + req.params.user + ' with option ' +  req.query.option
      done();
    });
  });

  it('prints out "Page for user USERNAME with option VALUE" when user goes to /user/USERNAME?option=VALUE', function (done) {
    superagent.get('http://localhost:3000/user/USERNAME?option=VALUE', function (error, res) {
      assert.ifError(error);
      assert.equal(res.status, 200);
      assert.equal(res.text, "Page for user USERNAME with option VALUE");
      // Page for user ' + req.params.user + ' with option ' +  req.query.option
      done();
    });
  });
  */
});
