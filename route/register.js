const express = require('express')
const User = require('../models/req_user')
const validator = require('../middlewares/valid_form').register_updatePassword
const uid = require('rand-token').uid
const router = express.Router()
const notifications = require('../models/notifications').actions

router.route('/register')
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
				response.render("pages/index", {registerObj: ret})
			}
			else
			{
				User.getUser("WHERE id='"+userId+"'", (res) => {
					if (res !== undefined && res){
						/*Envoi d'un mail d'inscription*/
						notifications.mail_with_links(res, "register", "http://localhost:4000/validRegister/"+jeton)
						.then((result) => {
							ret.notif = result
							ret.global_msg.push('Un mail de validation d\'inscription a été envoyé à l\'adresse renseignée !')
							ret.success.push(true)
							response.render("pages/index", {registerObj: ret})
						}, (err) => response.send(err))
					}else{
						/*Erreur lors de la récupération du nouvel utilisateur*/
						ret.global_msg.push('Erreur lors de la récupération du nouvel utilisateur, contactez le support !')
						ret.success.push(false)
						response.render("pages/index", {registerObj: ret})
					}
				})
			}
		})
})
module.exports = router
