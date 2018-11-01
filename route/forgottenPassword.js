const express = require('express')
const User = require('../models/req_user')
const validator = require('../middlewares/valid_form2').forgottenPassword
const uid = require('rand-token').uid
const router = express.Router()

router.route('/forgottenPassword')
	.get((request, response) => {
	})
	.post(validator, (request, response) => {
		let table = []
		for (let prop in request.body){
			table.push(request.body[prop])
		}
		User.getUser("email='"+table[0]+"'", (res) => {
			let ret = {}
			ret.success = []
			ret.global_msg = []
			let errors = {}
			if (res !== undefined && res)
			{
				//MISE A JOUR DU JETON UTILISATEUR
				let jeton = uid(16)
				User.insertToken(jeton, res.id, (result) => {
					if (result == 0)
					{
						ret.success.push(false);
						ret.global_msg.push('Erreur lors de la mise à jour de l\'utilisateur, veuillez contacter le support/modérateur !')
						errors.login = ['Une erreur technique est survenue lors de l\'envoi du mail de modification du mot de passe !']
						ret.errors = errors
					}
					else
					{
						ret.success.push(true);
						ret.global_msg.push('Un mail de récupération de mot de passe a été envoyé à l\'adresse fournie !', jeton)
					}
					response.send(ret)
				})
				//ENVOI DU MAIL DE RECUPERATION DE MOT DE PASSE A FAIRE
			}
			else
			{
				ret.success.push(false);
				errors.login = ['Utilisateur non trouvé !']
				ret.errors = errors
				response.send(ret)
			}
		})
	})
module.exports = router
