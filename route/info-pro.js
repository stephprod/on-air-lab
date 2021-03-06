let express = require('express')
let User = require('../models/req_user')
let validator = require('../middlewares/valid_form2').valid_profile

let router = express.Router()

router.route('/info-pro')
	.get((request, response) => {
		let offr = []
		let serv = []
		let allServ = []
		let devis = []
		let presta = []
		let etab = []
		//DEBUG
		//request.session.userId = 18
		//request.session.userName = "Unnom"
		//request.session.userType = 2
		response.locals.session = request.session
		if (request.session.userId == undefined || request.session.userType == 4) {
			response.render('pages/index')
		}else{
			User.displayOffre(request.session.userId, (result) => {
				console.log("offre")
				console.log(result)
				offr = result
				User.getInfoPro_etablissement(request.session.userId, (result) => {
					//console.log("etablissement")
					//console.log(result)
					etab = result
					User.displayServiceForPro(request.session.userId, (result) => {
						//console.log("service")
						//console.log(result)
						serv = result
						if (request.session.userType == 2){
							User.displayAllAudioServices((result) => {
								allServ = result
								User.displayDevis(request.session.userId, (result) => {
									//console.log("devis")
									//console.log(result)
									devis = result

									if (result.length > 0){
										response.render('pages/info-pro2', {offObj : offr, etabObj: etab, allServObj: allServ, servObj: serv, devisObj: devis})
									}
									else
									{
										response.render('pages/info-pro2', {offObj : offr, etabObj: etab, allServObj: allServ, servObj: serv})
									}
								})
							})
					}else{
						User.displayAllVideoServices((result) => {
								allServ = result
								User.displayDevis(request.session.userId, (result) => {
									devis = result
									if (result.length > 0){
										response.render('pages/info-pro2', {offObj : offr, etabObj: etab, allServObj: allServ, servObj: serv, devisObj: devis})	
									}
									else
									{
										response.render('pages/info-pro2', {offObj : offr, etabObj: etab, allServObj: allServ, servObj: serv})
									}
								})
							})
					}
				})
				})
			})
		}
        console.log("ID du GARS "+request.session.userId)
        console.log("NOM du GARS "+request.session.userName)
	})
	.post(validator, (request, response) => {
		let table = [], ret = {}, tableE = [], tableP = []
		ret.success = []
		ret.global_msg = []
		for (let prop in request.body){
			table.push(request.body[prop])
		}
		console.log(request.body)
		//console.log(table)
		//response.send(true)
		if (table[0] == "etab"){
			User.getEtablissement(request.session.userId, (result) => {
				if (result == 0) {
					//INSERTION
					tableE.push(table[1], table[2], table[3], table[4], table[5])
					User.infoPro_etablissement(tableE, (result) => {
						if (result == 0){
							ret.success.push(false)
							ret.global_msg.push("Echec lors de l'insertion des données de l'établissement, contactez le modérateur du site !")
							console.log("echec")
						}
						else{
							tableP.push(request.session.userId, result)
							User.infoPro_profil_empty(tableP, (result2) => {
								if (result2 == 0){
									ret.success.push(false)
									ret.global_msg.push("Echec lors de l'insertion des données du profil à vide, contactez le modérateur du site !")
								}else{
									ret.success.push(true)
									ret.global_msg.push("Profil enregistré avec succès !")
									console.log("succes data envoyer")
								}
								response.send(ret)
							})
						}
					})
				}else{
					//MISE A JOUR
					table.push(request.session.userId)
					if (isNaN(table[3]))
						table[3] = null
					User.update_etablissement("nom='"+table[1]+"',adresse='"+table[2]+"',cp='"+table[3]+"',descr='"+table[4]+"',siret='"+table[5]+"' WHERE profil.id_user='"+table[6]+"'", (result) => {
						console.log("-----------UPDATE OK----------")
						console.log("-----------"+result+" LIGNE CHANGE---------")
						if (result > 0){
							ret.success.push(true)
							ret.global_msg.push("Profil mis à jour avec succès !")
							console.log("Success mise à jour table etablissement !")
						}else{
							ret.success.push(false)
							ret.global_msg.push("Echec lors de la mise à jour du profil, (aucune modification à effectuer) !")
							console.log("Echec mise a jour table etablissement !")
						}
						response.send(ret)
					})
				}
			})
		}else{
			let servicesChecked = table[1]
			let tableInsert = []
			let tableDelete = []
			let finalResult = 0
			tableDelete.push(request.session.userId)
			User.delete_services_for_user(tableDelete, (res) =>{
				if (servicesChecked !== undefined){
					tableInsert.push(request.session.userId)
					for (k in servicesChecked){
						setTimeout((function(k, tableInsert) {
						 	return function(){
						 		tableInsert[1] = servicesChecked[k]
								User.add_services(tableInsert, (result) =>{
									finalResult += parseInt(result)
									console.log(k+ " - "+finalResult+" - "+result)
									if (k == servicesChecked.length - 1){
										if (finalResult == servicesChecked.length){
											ret.success.push(true)
											ret.global_msg.push("Mise à jour des services effectuée !")
										}
										else{
											ret.success.push(false)
											ret.global_msg.push("Echec lors de la mise à jour des services, contactez support/modérateur !")					
										}
										ret.result = finalResult
										response.send(ret)
									}
								})
						 	};
						 }) (k, tableInsert), 100)
					}
				}
				else{
					//Aucun service sélectionné
					ret.success.push(true)
					ret.global_msg.push("Mise à jour des services effectuée, cependant aucun service n'a été sélectionné : vous n'apparaîtrez pas dans les recheches !")
					response.send(ret)
				}
			})
		}
})

module.exports = router