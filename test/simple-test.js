var assert = require('assert');
var server = require('../server').server;
var addresses = require('../server').host;
var app = require('../server').application;
var http = require('http');
describe('List of simple mocha tests', function() {
	this.timeout(15000);
	before("Require all dependencies", function() {
		// runs before all tests in this block
		/*server.close();
		server.listen(8080, function (){
			console.log('listening on :8080 for testing')
			console.log('host : ');
			console.log(addresses);
		});*/
		console.log('host : '+addresses[0]);
	});
	describe('#indexOf()', function() {
		it('should return -1 when the value is not present', function(done) {
		  assert.equal([1,2,3].indexOf(4), -1);
		  done();
		});
	});
	describe('#test connection to the app on search page', function() {
		it('should return 200', function(done) {
			http.get('http://'+addresses[0]+':4000/search', function (res) {
		      	assert.equal(200, res.statusCode);
		      	done();
		    });
		});
	});
	after(function() {
	    // runs after all tests in this block
	    server.close();
	});
	beforeEach(function() {
    	// runs before each test in this block
	});

	afterEach(function() {
		// runs after each test in this block
		//server.listen(8000);
	});
});