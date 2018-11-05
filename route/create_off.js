const express = require('express')
const User = require('../models/req_user')
const validator = require('../middlewares/valid_form2').valid_offre
const router = express.Router()

router.route('/create_off')
	.post(validator, (request, response) => {
		let table = []
		let tableO = []
		let tableC = []
		let ret = {}
		ret.success = []
		ret.global_msg = []
		//console.log(request.body)
		//table.push(request.session.userId)
		if (request.session.token == request.headers['x-access-token']){
			let tmp = request.body.idO
			//console.log(tmp)
			delete request.body.idO
			for (let prop in request.body){
				table.push(request.body[prop])
			}
			//console.log(table)
			if (request.body.action ==  "insert_update"){
				User.getOffre(request.session.userId, (result) => {
					if (tmp == 0) {
						tableO.push(table[0].replace(/'/g, "\\'"), table[1].replace(/'/g, "\\'"), table[2])
						User.infoPro_offre(tableO, (result2) => {
							if (result2 == 0){
								ret.success.push(false)
								ret.global_msg.push("Echec lors de l'insertion de l'offre, contactez le modérateur !")
								//console.log("echec insertion table offre")
								response.send(ret)
							}
							else{
								tableC.push(table[3], result2)
								User.infoPro_content(tableC, (result3) => {
									if (result3 > 0){
										ret.success.push(true)
										ret.global_msg.push("Insertion de l'offre effectuée !")
										//console.log("succes data envoyer")
									}
									else{
										ret.success.push(false)
										ret.global_msg.push("Echec lors de l'insertion de l'offre (table liée), contactez le modérateur !")
										//console.log("echec insertion table contenir")
									}
									response.send(ret)
								})
							}
						})
					}else{
						table.push(tmp)
						//console.log(table)
						User.update_offre("titre='"+table[0].replace(/'/g, "\\'")+"',spe_off='"+table[1].replace(/'/g, "\\'")+"',prix_off='"+table[2]+"' WHERE id_offre='"+table[5]+"'", (result) => {
							//console.log("-----------UPDATE OK----------")
							//console.log("-----------"+result+" LIGNE CHANGE---------")
							ret.result = result
							ret.success.push(true)
							ret.global_msg.push("Offre mise à jour avec succès !")
							response.send(ret)
						})
					}
				})
			}else{
				//Suppression des offre
				User.delete_offre(table[1], (result) => {
					//console.log("-----------DELETE OK----------")
					//console.log("-----------"+result+" LIGNE CHANGEE(S)---------")
					if (result > 0){
						ret.success.push(true)
						ret.global_msg.push("Offre supprimée avec succès !")
					}
					else{
						ret.success.push(false)
						ret.global_msg.push("Erreur lors de la suppression de l'offre !")
					}
					response.send(ret)
				})
			}
		}else{
			ret.success.push(false)
			ret.global_msg.push("Compromised token !")
			response.send(ret)
		}
})

module.exports = router
