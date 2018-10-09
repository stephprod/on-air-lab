let express = require('express')
let User = require('../models/req_user')
let router = express.Router()
let validator = require('../middlewares/valid_form').delete_account_form

router.route('/delete-account')
	.get((request, response) => {
		
	})
	.post((request, response) => {
		let table = [], ret = {}
		ret.success = []
		ret.global_msg = []
		console.log(request.body)
		for (let prop in request.body){
			table.push(request.body[prop])
		}
		console.log(table);
		//Suppression de compte
		User.delete_tarification(table, (result)=>{
			if (result > 0){
				ret.success.push(true)
				ret.global_msg.push("Tarification supprimée !")
				User.delete_etablissement(table, (result2)=>{
					if (result2 > 0){
						ret.success.push(true)
						ret.global_msg.push("Etablissement supprimé !")
						User.delete_user(table, (result3)=>{
							if (result3 > 0){
								ret.success.push(true)
								ret.global_msg.push("Utilisateur supprimé !")
							}else{
								ret.success.push(false)
								ret.global_msg.push("Une erreur est survenue lors de la suppression de l'Utilisateur, contactez le support/modérateur !")
							}
							response.send(ret)
						})
					}else{
						ret.success.push(false)
						ret.global_msg.push("Une erreur est survenue lors de la suppression de l'Etablissement, contactez le support/modérateur !")
						response.send(ret)
					}
				})
			}
			else{
				ret.success.push(false)
				ret.global_msg.push("Une erreur est survenue lors de la suppression de la Tarification, contactez le support/modérateur !")
				response.send(ret)
			}
		})
	})
module.exports = router