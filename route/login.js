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
		User.getUserForLogin(
			"LEFT JOIN `payments` ON `payments`.`id_pro`=`user`.`id` "+ 
			"WHERE `user`.`email`='" + table[0] + "' AND " +
			"`user`.`mot_de_passe`='" + table[1] + "' ORDER BY `payments`.`date_payment` DESC"
			, (result) => {
				let errors = {}
				if (result.length == 0){
					ret.global_msg.push("Utilisateur non authentifié !")
					errors.password = ['La combinaison email/mot de passe est invalide !']
					errors.login = ['La combinaison email/mot de passe est invalide !']
					ret.errors = errors
					ret.success.push(false)
					response.send(ret)
				}
				else{
					/*Redirection vers page d'accueil*/
					//var userSess
					if (result[0].verifie == 0){
						ret.global_msg.push("Utilisateur non vérifié !")
						errors.password = ['Veuillez activer votre compte !']
						errors.login = ['Veuillez activer votre compte !']
						ret.errors = errors
						ret.success.push(false)
						response.send(ret)
					}else{
						ret.success.push(true)
						ret.global_msg.push("Utilisateur authentifié !")
						let res = {}
						res.id = result[0].id
						res.nom = result[0].nom
						res.prenom = result[0].prenom
						res.type = result[0].type
						ret.result = res
						userSess = request.session
						userSess.userId = result[0].id
						userSess.userName = result[0].nom
						userSess.userFirstName = result[0].prenom
						userSess.userType = result[0].type
						userSess.token = result[0].jeton
						//userSess.pay_module = result[0].payment_module
						userSess.userMail = result[0].email
						if (res.type != 4){
							//console.log(result[0])
							if (result[0].state_payment == "valide")
								userSess.abonnement = true
							else
								userSess.abonnement = false
						}
						console.log('Tu est connecter avec id bdd ' +userSess.userId)
						console.log('Tu est connecter avec le nom '+userSess.userName)
						//console.log(userSess)
						User.updateUser("disponibilite='1' WHERE id='"+result.id+"'"
						, () => {
								//ret.global_msg.push("dispo mis à jour avec succés !")
								//ret.success.push(true)
								console.log('le champs Disponible est actuellement a 1')
								response.send(ret)
						})
					}
				}
		})
})
module.exports = router
