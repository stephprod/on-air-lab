const express = require('express')
const User = require('../models/req_user')
const validator = require('../middlewares/valid_form2').login

const router = express.Router()

router.route('/login')
	.get((request, response) => {
		response.locals.session = request.session
		response.render('pages/index')
	})
	.post(validator, (request, response) => {
		let table = [], ret = {}
		ret.global_msg = []
		ret.success = []
		for (let prop in request.body){
			table.push(request.body[prop])
		}
		User.getUser(
			"email='" + table[0] + "' AND " +
			"mot_de_passe='" + table[1] + "'"
			, (result) => {
				let errors = {}
				if (result == undefined || !result){
					ret.global_msg.push("Utilisateur non authentifié !")
					errors.password = ['La combinaison email/mot de passe est invalide !']
					errors.login = ['La combinaison email/mot de passe est invalide !']
					ret.errors = errors
					ret.success.push(false)
					response.send(ret)
				}
				else{
					/*Redirection vers page d'accueil*/
					ret.success.push(true)
					ret.global_msg.push("Utilisateur authentifié !")
					let res = {}
					res.id = result.id
					res.nom = result.nom
					res.prenom = result.prenom
					res.type = result.type
					ret.result = res
					userSess = request.session
					userSess.userId = result.id
					userSess.userName = result.nom
					userSess.userFirstName = result.prenom
					userSess.userType = result.type
					userSess.token = result.jeton
					userSess.pay_module = result.payment_module
					console.log('Tu est connecter avec id bdd ' +userSess.userId)
					console.log('Tu est connecter avec le nom '+userSess.userName)
					User.updateUser("disponibilite='1' WHERE id='"+result.id+"'"
					, (result) => {
							//ret.global_msg.push("dispo mis à jour avec succés !")
							//ret.success.push(true)
							console.log('le champs Disponible est actuellement a 1')
							response.send(ret)
					})
				}
		})
})
module.exports = router
