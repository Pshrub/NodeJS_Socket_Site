// put tests for the server.js file here
var server = require('./server');
var assert = require('assert');
var expect = require('expect');
var superagent = require('superagent');

// test going to the main site page returns an HTTP status code of 200

describe('serv', function() {
  var serv;

  before(function() {
    serv = server().listen(3000);
  });

  after(function() {
    serv.close();
  });

  it('returns and HTTP status code of 200 when user goes to /', function (done) {
    superagent.get('http://localhost:3000/', function (error, res) {
      assert.ifError(error);
      assert.equal(res.status, 200);
      done();
    });
  });

  it("returns a 404 and correct message when going to a non-existent page", function (done) {
    superagent.get('http://localhost:3000/blah', function (error, res) {
      assert.equal(res.status, 404);
      assert.equal(res.text, "Error 404: resource not found");
      done();
    });
  });

  it("tests the expect library", function () {
      expect(true).toBe(true);
  });

});
