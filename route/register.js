let express = require('express')
let User = require('../models/req_user')
let validator = require('../middlewares/valid_form').register_updatePassword
let uid = require('rand-token').uid
let router = express.Router()

router.route('/register')
	.get((request, response) => {
		//response.render('pages/index', {name : "index"})
	})
	.post(validator, (request, response) => {
		let created_date = new Date()
		let table = []
		let ret = {}
		ret.success = []
		ret.global_msg = []
		delete request.body.confirm_password
		for (let prop in request.body){
			table.push(request.body[prop])
		}
		if(table.length < 5)
			table.push(1)
		let jeton = uid(16)
		table.push(created_date, jeton)
		User.create(table, (userId) => {
			if (userId == 0)
			{
				let errors ={}
				ret.global_msg.push('Erreur lors de l\'insertion de l\'utilisateur, veuillez contacter le support/modérateur !')
				errors.nom = ['Une erreur technique est survenue lors de l\'inscription de l\'utilisateur !']
				ret.success.push(false)
				ret.errors = errors
			}
			else
			{
				/*Envoi d'un mail d'inscription*/
				ret.global_msg.push('Un mail de validation d\'inscription a été envoyé à l\'adresse renseignée !')
				ret.success.push(true)
			}
			response.send(ret)
		})
})
module.exports = router