let express = require('express')
let validator = require('../form_validator')
let session = require('express-session')

let valid_form = (request, response, next) => {

	let errors = {}
	let err_flag = false;
	let email = request.body.email
	
	if (!validator.isEmail(email))
	{
		errors.email = ["Email invalide !"]
		err_flag = true;
		
	}
//	request.session.errors = errors
//	let ret = request.session.errors
//	request.session.errors = undefined
	if (err_flag)
	{	
		let ret = {}
		ret.success = false;
		ret.errors = errors;
		response.send(ret)
	}
	else
		next()
	
}

module.exports = valid_form