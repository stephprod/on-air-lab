const express = require('express')
const User = require('../models/req_user')

const router = express.Router()

router.route('/devis')
	.post((request, response) => {
		let table = []
		let tableP = []
		let tableD = []
		let ret = {}
		ret.global_msg = []
		ret.success = []
		if (request.session.token == request.headers["x-access-token"]){
		for (let prop in request.body){
			table.push(request.body[prop])
		}
		//console.log(request.session)
		//console.log(table)
		if (table[1] == "display"){
			User.getDevis(table[0], (result) => {
				if (result > 0){
					ret.devis_id = table[0]
					//SI L'ID DU DEVIS EXISTE, MISE A JOUR DEVIS
						User.update_devis("total_ht='"+table[2]+"', tva='"+table[3]+"', price_ttc='"+table[4]+"', name='"+table[5]+"' WHERE id_devis="+table[0], (result2) => {
							if (result2 > 0){
								ret.success.push(true)
								console.log("success mise à jour table devis")
							}
							else
							{
								ret.success.push(false)
								console.log("erreur mise à jour table devis")
							}
							User.getPresta(table[0], (result2) => {
								if (result2.length > 0)
									ret.prestas = result2
								response.send(ret)
							})
						})
				}else{
					//SINON, INSERTION DEVIS/PRESTATION VIDE
					tableD.push(null, table[2], table[3], table[4], table[5])
					User.insertDevis(tableD, (result) =>{
						if (result > 0){
							ret.devis_id = result
							console.log("success insertion devis "+result)
							tableP.push(result, request.session.userId)
							User.insertPrestationEmpty(tableP, (result2)=>{
								if (result2 > 0){
									ret.success.push(true)
									ret.presta_id = result2
									console.log("success insertion table prestation a vide")
								}else{
									ret.success.push(false)
									console.log("erreur insertion table prestation a vide")
								}
								response.send(ret)
							})
						}
						else{
							ret.success.push(false)
							console.log("echec insertion devis")
							response.send(ret)
						}
					})
					}
				})
			}else if (table[1] == "save"){
				let id_d, name, tva, priceHT, priceTT, tableRows
				if (isNaN(request.body["id_devs[]"]))
					tableRows = request.body["id_devs[]"]
				else
					tableRows = [ request.body["id_devs[]"] ]
				for (k in tableRows){
					tableD = []
					tableP = []
					setTimeout((function(k, tableD, tableP) {
						return function(){
							if (tableRows.length > 1)
							{
								id_d = request.body["id_devs[]"][k]
								name = request.body["names[]"][k]
								tva = request.body["tvas[]"][k]
								priceHT = request.body["pricesHT[]"][k]
								priceTT = request.body["pricesTT[]"][k]
							}else{
								id_d = request.body["id_devs[]"]
								name = request.body["names[]"]
								tva = request.body["tvas[]"]
								priceHT = request.body["pricesHT[]"]
								priceTT = request.body["pricesTT[]"]
							}
							if (id_d == 0){
								//INSERTION DEVIS/PRESTATION VIDE
								//tableD = []
								tableD.push(null, priceHT, tva, priceTT, name)
								User.insertDevis(tableD, (result) =>{
									if (result > 0){
										//ret.success = true
										ret.success.push(true)
										ret.global_msg.push("Insertion du devis effectuée !")
										console.log("success insertion devis "+result)
										//tableP = []
										tableP.push(result, request.session.userId)
										//console.log(request.session.userId)
										User.insertPrestationEmpty(tableP, (result2)=>{
											if (result2 > 0){
												//console.log(ret);
												ret.success.push(true)
												ret.global_msg.push("Insertion d'une prestation à vide effectuée !")
												console.log("success insertion table prestation")
											}else{
												ret.success.push(false)
												ret.global_msg.push("Echec de l'insertion d'une prestation à vide (table liée), contactez le support !")
												console.log("erreur insertion table prestation")
											}
											if (k == tableRows.length - 1){
												//console.log(ret)
												response.send(ret)
											}
										})
									}
									else{
										ret.success.push(false)
										ret.global_msg.push("Echec de l'insertion du devis !")
										console.log("echec insertion table devis !")
										if (k == tableRows.length - 1){
											//console.log(ret)
											response.send(ret)
										}
									}
								})
							}else{
								//console.log(id_d)
								//MISE A JOUR DEVIS
								User.update_devis("total_ht='"+priceHT+"', tva='"+tva+"', price_ttc='"+priceTT+"', name='"+name+"' WHERE id_devis="+id_d, (result) => {
									if (result > 0){
										ret.success.push(true)
										ret.global_msg.push("Modèle de devis mise à jour !")
										console.log("success mise à jour table devis")
									}
									else{
										ret.success.push(false)
										ret.global_msg.push("Echec lors de la mise à jour du modèle de devis (Aucune modification à effectuer) !")
										console.log("erreur mise à jour table devis")
									}
									if (k == tableRows.length - 1){
										//console.log(ret)
										response.send(ret)
									}
								})
							}
						};
					}) (k, tableD, tableP), 100)
				}
			}
			else{
				//SUPPRESION DEVIS
				User.delete_devis(request.body.id_dev, (result) =>{
					if (result > 0){
						ret.success.push(true)
						ret.global_msg.push("Modèle de devis supprimé !")
						console.log("success suppression table devis")
					}else{
						ret.success.push(false)
						ret.global_msg.push("Echec lors de la suppression du modèle de devis, contactez le support/modérateur !")
						console.log("echec suppression table devis")
					}
					response.send(ret)
				})
			}
		}else{
			ret.success.push(false)
			ret.global_msg.push("Token compromised !")
			response.send(ret)
		}
})

module.exports = router
