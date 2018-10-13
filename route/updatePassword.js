*-*let express = require('express')
let User = require('../models/req_user')
let validator = require('../middlewares/valid_form').register_updatePassword

let router = express.Router()

router.param('token', (req, res, next, token) => {
	req.session.token = token
	User.getUser("jeton='"+token+"'", (res) => {
		if (res !== undefined && res)
			req.user = res
		next()
	})
})
	
router.route('/updatePassword/:token')
	.get((request, response) => {
		if (request.user == undefined && request.session.token != 'default')
			response.locals.msg = ["Oups ! Liens corrompu ou expiré."]
		response.locals.token = request.session.token
		response.render('pages/updatePassword', {name : "updatePassword"})
	})
	.post(validator, (request, response) => {
		let table = []
		for (let prop in request.body){		
			table.push(request.body[prop])
		}
		User.updateUser("mot_de_passe='"+table[0]+"', jeton=NULL WHERE jeton='"+request.session.token+"'"
		, (result) => {
			let ret = {}
			if (result > 0)
			{
				request.session.token = undefined
				ret.msg = ["Mot de passe mis à jour avec succés !"]
				ret.success = true
			}
			else
			{
				let errors = {}
				errors.password = ["Une erreur technique est survenue lors de la modification de mot de passe !"]
				errors.confirm_password = ["Une erreur technique est survenue lors de la modification de mot de passe !"]
				ret.errors = errors
				ret.success = false
			}
			response.send(ret)
	})	
})
module.exports = router