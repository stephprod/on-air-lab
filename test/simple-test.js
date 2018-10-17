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
	describe('#indexOf()', function() {
		it('should return -1 when the value is not present', function(done) {
		  assert.equal([1,2,3].indexOf(4), -1);
		  done();
		});
		describe('HTTP REQUEST', function() {
			beforeEach(() =>{
		    	// runs before each test in this block
		    	//nock('http://'+addresses[0]+':4000');
			});
			it('should return 200', () => {
				return testSearchHttpRequest('http://'+addresses[0]+':4000/search').then(response =>{
					expect(response.status).to.equals(200);
				}).catch(error => {
					console.log(error);
				});
				/*http.get('http://'+addresses[0]+':4000/search', function (res, err, done) {
			      	assert.equal(200, res.statusCode);
			      	done();
			    });*/
			    /*chai.request(server)
				    .get('http://'+addresses[0]+':4000/search')
				    .end(function(err, res){
				      res.should.have.status(200);
				      done();
				});*/
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