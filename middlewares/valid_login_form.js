let express = require('express')
let validator = require('../form_validator')
let session = require('express-session')
let User = require('../models/req_user')

let valid_login_form = (request, response, next) => {

	let errors = {}
	let err_flag = false;
	let email = request.body.email
	let mdp = request.body.password

	if (!validator.isEmail(email))
	{
		errors.email = ["Email invalide !"]
		err_flag = true;
		
	}
	if (!validator.isSafePass(mdp))
	{
		errors.password = ["Mot de passe invalide !"]
		err_flag = true;
	}
	if (err_flag)
	{
		let ret = {}
		ret.errors = errors
		ret.success = false
		response.send(ret)
	}
	else
		next()
}

module.exports = valid_login_form