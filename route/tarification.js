const express = require('express')
const User = require('../models/req_user')

const router = express.Router()

router.route('/tarification')
	.get((request, response) => {

	})
	.post((request, response) => {
		let table = []
		//table.push(request.session.userId)
		console.log(request.body)
		for (let prop in request.body){
			table.push(request.body[prop])
		}
		let ret = {}
		ret.success = []
		ret.global_msg = []
		User.getTarification(request.session.userId, (result) => {
			if (result == 0) {
				User.infoPro_tarification(table, (result) => {
					if (result == 0){
						console.log("echec")
						ret.success.push(false)
						ret.global_msg.push("Echec lors de l'insertion de la tarification, contactez le support/modérateur !")
						response.send(ret)
						//response.render('pages/info-pro', {offObj: "vide"})
					}
					else{
						User.infoPro_tarification_updateprofil(result, request.session.userId, (result2) =>{
							if (result2 > 0){
								ret.success.push(true)
								ret.global_msg.push("Tarification crée avec succès !")
								console.log("succes data envoyer")
							}
							else{
								ret.success.push(false)
								ret.global_msg.push("Erreur lors de la création de la tarification (table liée), contactez le support/modérateur !")
								console.log("echec data envoyer")
							}
							response.send(ret)
						})
						//response.render('pages/info-pro', {offObj: "vide"})
					}
				})
			}else{
				table.push(request.session.userId)
				//console.log(table)
				User.update_tarification("prix_min='"+table[0]+"',prix_h='"+table[1]+"',nbr_h_min='"+table[2]+"' WHERE profil.id_user='"+table[3]+"'", (result) => {
					console.log("-----------UPDATE OK----------")
					console.log("-----------"+result+" LIGNE CHANGE---------")
					//response.render('pages/info-pro', {name: "info-pro", offObj: "vide"})
					if (result > 0){
						ret.success.push(true)
						ret.global_msg.push("Tarification modifiée avec succès !")
					}
					else{
						ret.success.push(false)
						ret.global_msg.push("Erreur lors de la modification de la tarification - Aucun changement à effectuer - !")
					}
					response.send(ret)
				})
			}
		})
})

module.exports = router
