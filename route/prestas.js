const express = require('express')
const User = require('../models/req_user')

const router = express.Router()

router.route('/prestas')
	.post((request, response) => {
		let table = []
		let tableP = []
		let tableD = []
		let tabRows = []
		let ret = {}
		ret.global_msg = []
		ret.success = []
		if (request.session.token == request.headers["x-access-token"]){
			//console.log(request.body)
			if (request.body.action == "save"){
			if (isNaN(request.body["id_prestas[]"]))
				tabRows = request.body["id_prestas[]"]
			else
				tabRows = [request.body["id_prestas[]"]]
			for (k in tabRows){
				tableP = []
				setTimeout((function(k, tableP, body) {
					return function(){
						let desc, qte, p_u, id_p, serv_id
						//console.log(isNaN(request.body["id_prestas[]"]))
						if (tabRows.length > 1)
						{
							desc = request.body["descr[]"][k].replace(/'/g, "\\'")
							qte = request.body["quantities[]"][k]
							p_u = request.body["pricesU[]"][k]
							id_p = request.body["id_prestas[]"][k]
							serv_id = request.body["services[]"][k]
						}else{
							desc = request.body["descr[]"].replace(/'/g, "\\'")
							qte = request.body["quantities[]"]
							p_u = request.body["pricesU[]"]
							id_p = request.body["id_prestas[]"]
							serv_id = request.body["services[]"]
						}
						if (isNaN(serv_id) || serv_id == 0)
							serv_id = null
						//console.log("update serv-id "+serv_id+" desc-"+desc+" qte-"+qte+" p_u"+p_u+" id_p"+id_p+" k"+k)
						if (id_p == 0){
							//CREATION
							tableP.push(null, desc, qte, p_u,
								request.body.id_devis, serv_id, request.session.userId)
							//console.log(tableP)
							User.insertPrestation(tableP, (result)=>{
								if (result > 0){
									ret.success.push(true)
									ret.global_msg.push("Insertion de la prestation effectuée !")
									console.log("success insertion table prestation !")
								}
								else{
									ret.success.push(false)
									ret.global_msg.push("Echec lors de l'insertion de la prestation, contactez le support/modérateur !")
									//console.log("echec insertion table prestation !")
								}
							})
						}else{
							//MISE A JOUR PRESTATION
							//console.log("update desc-"+desc+" qte-"+qte+" p_u"+p_u+" id_p"+id_p+" k"+k)
							User.update_prestation("id_serv="+serv_id+", descr='"+desc+"', quantity='"+qte+"', price_u='"+p_u+"' WHERE id_presta="+id_p, (result) => {
								if (result > 0){
									ret.success.push(true)
									ret.global_msg.push("Mise à jour de la prestation effectuée !")
									//console.log("success mise à jour table prestation !")
								}else{
									ret.success.push(false)
									ret.global_msg.push("Echec lors de la mise à jour de la prestation, (Aucune modification à effectuer) !")
									//console.log("echec mise à jour table prestation !")
								}
							})
						}
						if (k == tabRows.length - 1){
							//MISE A JOUR DEVIS
							//console.log(body.id_devis+" "+body.totalHT)
							User.update_devis("total_ht='"+body.totalHT+"', price_ttc="+body.totalTT+" WHERE id_devis="+body.id_devis, (result) => {
								if (result > 0){
									ret.success.push(true)
									ret.global_msg.push("Mise à jour du devis effectuée !")
									//console.log("success mise à jour table devis")
								}
								else
								{
									ret.success.push(false)
									ret.global_msg.push("Echec lors de la mise à jour du devis, (aucune modification à effectuer) !")
									//console.log("erreur mise à jour table devis")
								}
								response.send(ret)
							})
						}
					}
				}) (k, tableP, request.body), 100)
			}
			}else{
				//SUPPRESSION PRESTATION
				table.push(request.body.id_presta)
				User.delete_presta(table, (result) => {
					if (result > 0){
						ret.success.push(true)
						ret.global_msg.push("Prestation supprimée !")
						//console.log("success suppression table prestation !")
						//Update devis
						User.update_devis("total_ht='"+request.body.totalHT+"', price_ttc="+request.body.totalTT+" WHERE id_devis="+request.body.id_devis, (result) => {
							if (result > 0){
								ret.success.push(true)
								ret.global_msg.push("Mise à jour du devis effectuée !")
								//console.log("success mise à jour table devis")
							}
							else{
								ret.success.push(false)
								ret.global_msg.push("Echec de la mise à jour du devis (contactez le support/modérateur) !")
								//console.log("erreur mise à jour table devis")
							}
							response.send(ret)
						})
					}
					else
					{
						ret.success.push(false)
						ret.global_msg.push("Echec de la suppression de la prestation (contactez le support/modérateur) !")
						//console.log("echec suppression table prestaiton !")
						response.send(ret)
					}
				})
			}
		}else{
			ret.success.push(false)
			ret.global_msg.push("Token compromised !")
			response.send(ret)
		}
})

module.exports = router
