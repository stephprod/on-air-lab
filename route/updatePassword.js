const express = require('express')
const User = require('../models/req_user')
const validator = require('../middlewares/valid_form').register_updatePassword

const router = express.Router()

router.param('token', (req, res, next, token) => {
	//console.log(token)
	req.session.token = token
	User.getUser("WHERE jeton='"+token+"'", (resu) => {
		if (resu !== undefined && resu){
			req.user = resu
			next()
		}else{
			res.locals.session = req.session
			res.locals.session.msg = ["Oups ! Liens corrompu ou expiré."]
			res.render("pages/updatePassword")
		}
	})
})

router.route('/updatePassword/:token')
	.get((request, response) => {
		// if (request.user == undefined && request.session.token != 'default')
		// 	response.locals.msg = ["Oups ! Liens corrompu ou expiré."]
		response.locals.session = request.session
		response.locals.session.user = request.user
		//console.log(response.locals)
		response.render('pages/updatePassword')
	})
	.post(validator, (request, response) => {
		let table = [], ret = {}
		ret.success = []
		ret.global_msg = []
		for (let prop in request.body){
			table.push(request.body[prop])
		}
		User.updateUser("mot_de_passe='"+table[0]+"' WHERE jeton='"+request.session.token+"'"
		, (result) => {
			if (result > 0)
			{
				ret.global_msg = ["Mot de passe mis à jour avec succès !"]
				ret.success.push(true)
			}
			else
			{
				let errors = {}
				errors.password = ["Une erreur technique est survenue lors de la modification de mot de passe !"]
				errors.confirm_password = ["Une erreur technique est survenue lors de la modification de mot de passe !"]
				ret.errors = errors
				ret.global_msg = ["Une erreur technique est survenue lors de la modification de mot de passe !"]
				ret.success.push(false)
			}
			response.send(ret)
	})
})
module.exports = router
