const express = require('express')
const User = require('../models/req_user')
const router = express.Router()
const validator = require('../middlewares/valid_form').delete_account_form

router.route('/delete-account')
	.post((request, response) => {
		let table = [], ret = {}
		ret.success = []
		ret.global_msg = []
		//console.log(request.body)
		if (request.session.token == request.headers["x-access-token"]){
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
		}else{
			ret.success.push(false)
			ret.global_msg.push("Compromised token !")
			response.send(ret)
		}
	})
module.exports = router
