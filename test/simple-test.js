var assert = require('assert');
var server = require('../server').server;
var addresses = require('../server').host;
//var app = require('../server').application;
const expect = require('chai').expect;
const nock = require('nock');

const testSearchHttpRequest = require('../server').httpRequest;
//var http = require('http');
//var chai = require('chai');
//var chaiHttp = require('chai-http');
//var should = chai.should();

//chai.use(chaiHttp);

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
	describe('#INDEX OF()', function() {
		it('expecting -1 when the value 4 is not present in (1, 2, 3)', function(done) {
		  assert.equal([1,2,3].indexOf(4), -1);
		  done();
		});
	});
	describe('#HTTP REQUEST SEARCH', function() {
		beforeEach(() =>{
	    	// runs before each test in this block
	    	//nock('http://'+addresses[0]+':4000');
		});
		it('expecting 200', (done) => {
			return testSearchHttpRequest('http://'+addresses[0]+':4000/search').then(response =>{
				expect(response.status).to.equals(200);
				done();
			}).catch(error => {
				console.log(error);
				done();
			});
		});
	});

	after(function() {
	    // runs after all tests in this block
	    server.close();
	});

	afterEach(function() {
		// runs after each test in this block
		//server.listen(8000);
	});
});