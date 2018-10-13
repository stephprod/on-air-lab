*-*let express = require('express')
let User = require('../models/req_user')
let validator = require('../middlewares/valid_form').search

let router = express.Router()

router.route('/search')
	.get((request, response) => {
		// Localisation par défaut (SCEAUX)
		if (request.session.pos === undefined){
			request.session.pos = "2.28333,48.7833"
		}
		//request.session.userId = 21
		//request.session.userName = "Unnom"
		//request.session.userType = 4
		response.locals.session = request.session
		//console.log(response.locals)
		if (request.session.userId == undefined || (request.session.userType == 4 || request.session.userType == 1)){
			User.getAllEtablissement(0, (result) => {
				//console.log(result)
				if (result != null){
					let tableEtab = []
					let etab = {}
					let lonA = request.session.pos.split(",")[0],
						latA = request.session.pos.split(",")[1]
					for (k in result){
						let lonB = 0.0,
							latB = 0.0
						etab = {}
						etab.id_etab = result[k].id
						etab.id_user = result[k].id_user
						etab.nom = result[k].nom
						etab.adresse = result[k].adresse
						etab.cp = result[k].cp
						etab.desc = result[k].descr
						etab.siret = result[k].siret
						etab.img = result[k].path_img
						etab.prix_h = result[k].prix_h
						etab.type_service = result[k].type_service
						//Calcul de distance
						lonB = result[k].ville_longitude_deg
						latB = result[k].ville_latitude_deg
						etab.distance = getDistance(lonA, lonB, latA, latB)
						tableEtab.push(etab)
					}
					//console.log(tableEtab)
					response.locals.listEtab = tableEtab
				}
				response.render('pages/search2')
			}) 
		} else {
			response.render('pages/index')
		}		
        //console.log("ID du GARS "+request.session.userId)
        //console.log("NOM du GARS "+request.session.userName)
	})
	.post((request, response) => {
		if (request.session.pos === undefined){
			request.session.pos = "2.28333,48.7833"
		}
		//console.log(request.body)
		let table = []
		let tableType = []
		let clauseTypeServices = ""
		let clauseServices = ""
		let clauseDispos = ""
		let clauseTarif = ""
		let clauseCodePostal = ""
		let clauseVille = ""
		let clauseDistance =""
		let ret = {}
		for (let prop in request.body){
			table.push(request.body[prop])
		}
		//console.log(table.length)
		switch(request.body.filtre_type_service)
		{
			case '0':
				tableType.push("audio")
				break;
			case '1':
				tableType.push("video")
				break;
			default:
				tableType.push("audio")
				break;
		}
		if (table.length == 1){
			if (table[0] !== undefined){
				//Requête vers la base données pour récupérer les services et les etablissements
				clauseTypeServices = "type_service = '"+
					tableType[0]+"'"
				clauseServices = "(`service`.`type_service`='"+
						tableType[0]+"')"
				User.get_services(clauseTypeServices, (res) => {
					ret.title = tableType[0][0].toUpperCase() + tableType[0].substring(1)
					ret.content = res
					User.getEtablissementInClause(0, clauseServices, (result) => {
							ret.listEtab = result
							if (request.body.filtre_type_service == '0'){
								User.getAllFrenchCp((res) =>{
									ret.cp = res
									//console.log(ret)
									response.send(ret)	
								})
							}
							else
							{
								response.send(ret)
							}
					})
				})
				//}
			}
		}else if(table.length > 1){
			for (k in request.body){
				if (k == "filtre_dispo[]"){
					let dispo = request.body[k]
					for (j in dispo){
						//console.log(serv.length)
						if (j != dispo.length - 1)
							clauseDispos += "`user`.`disponibilite`=" + dispo[j] + " OR "
						else
							clauseDispos += "`user`.`disponibilite`=" + dispo[j]
					}
				}
				if (k == "filtre_service[]"){
					let serv = request.body[k]
					for (j in serv){
						//console.log(serv.length)
						if (j != serv.length - 1)
							clauseServices += "`service`.`id_service`=" + serv[j] + " OR "
						else
							clauseServices += "`service`.`id_service`=" + serv[j]
					}
				}
				if (k == "filtre_tarif[]"){
					let tarif = request.body[k]
					//console.log(servs)
					if (tarif != "")
						clauseTarif = "`tarification`.`prix_h` >= "+parseInt(tarif[0])+" AND "+
							"`tarification`.`prix_h` <= "+parseInt(tarif[1])
				}
				//if (k == "filtre_ville[]"){
				//	let ville = request.body[k]
				//	if (ville != "")
				//		clauseVille = "`villes_france_free`.`ville_id` = "+ville[0]
				//}
				if (k == "filtre_code_postal" && request.body["filtre_distance"] == ""){
					let code_postal = request.body[k]
					if (code_postal != "")
						clauseCodePostal = "`villes_france_free`.`ville_departement` = '"+code_postal+"'"
				}
				if (k == "filtre_distance[]"){
					let distance = request.body[k]
					//console.log(servs)
					if (distance != "")
						clauseDistance = distance
				}
			}
			let clause = ""
			if (clauseServices.length > 0)
			{
				clause = "("+clauseServices+") "
				clause += clauseTarif.length > 0 ? "AND ("+clauseTarif+") " : ""
				clause += clauseDispos.length > 0 ? "AND ("+clauseDispos+") " : ""
				//clause += clauseVille.length > 0 ? "AND ("+clauseVille+") " : ""
				clause += clauseCodePostal.length > 0 ? "AND ("+clauseCodePostal+") " : ""
			}
			else
			{
				clause = "(`service`.`type_service`='"+tableType[0]+"') "
				clause += clauseTarif.length > 0 ? "AND ("+clauseTarif+") " : ""
				clause += clauseDispos.length > 0 ? "AND ("+clauseDispos+") " : ""
				//clause += clauseVille.length > 0 ? "AND ("+clauseVille+") " : ""
				clause += clauseCodePostal.length > 0 ? "AND ("+clauseCodePostal+") " : ""
			}
			//console.log(clause)
			User.getEtablissementInClause(0, clause, (result) => {
				//console.log(result)
				let lonA=0.0, lonB=0.0, latA=0.0, latB=0.0, distance=0.0
				if (request.body["filtre_ville[]"] !== undefined && request.body["filtre_ville[]"].length > 0){
					lonA = request.body["filtre_ville[]"][1]
					latA = request.body["filtre_ville[]"][2]
				}
				else
				{
					lonA = request.session.pos.split(",")[0]
					latA = request.session.pos.split(",")[1]
				}
				if (clauseDistance.length > 0){
					let res = []
					for (k in result){
						lonB = result[k].ville_longitude_deg
						latB = result[k].ville_latitude_deg
						distance = getDistance(lonA, lonB, latA, latB)
						//console.log("lonA "+lonA+" - latA "+latA)
						//console.log("lonB "+lonB+" - latB "+latB)
						//console.log("villeA "+request.body["filtre_ville[]"][0])
						//console.log("villeB "+result[k].ville_nom)
						//console.log("Distance "+distance)
						if (distance >= clauseDistance[0] && distance <= clauseDistance[1]){
							result[k].distance = distance
							res.push(result[k])
						}
					}
					ret.listEtab = res
				}
				else{
					for (k in result){
						lonB = result[k].ville_longitude_deg
						latB = result[k].ville_latitude_deg
						distance = getDistance(lonA, lonB, latA, latB)
						//console.log("lonA "+lonA+" - latA "+latA)
						//console.log("lonB "+lonB+" - latB "+latB)
						//console.log("villeA SCEAUX")
						//console.log("villeB "+result[k].ville_nom)
						//console.log("Distance "+distance)
						result[k].distance = distance
					}
					ret.listEtab = result
				}
				response.send(ret)
			})
		}
	})

function getDistance(lonA, lonB, latA, latB){
	let lonB_rad = parseFloat(lonB) * Math.PI / 180
	let latB_rad = parseFloat(latB) * Math.PI / 180
	let lonA_rad = parseFloat(lonA) * Math.PI / 180
	let latA_rad = parseFloat(latA) * Math.PI / 180
	let delta = latB_rad - latA_rad
	let acos = Math.acos((Math.sin(latA_rad) * Math.sin(latB_rad)) + 
		(Math.cos(latA_rad) * Math.cos(latB_rad) * Math.cos(delta)))
	let earth_radius = 6378137
	//console.log(lonA)
	//console.log(lonB)
	//console.log(latA)
	//console.log(latB)
	//console.log(lonA_rad)
	//console.log(lonB_rad)
	//console.log(latA_rad)
	//console.log(latB_rad)
	//console.log(delta)
	//console.log(acos * earth_radius)
	//console.log("-")
	return isNaN((acos * earth_radius) / 1000) ? 99999 : (acos * earth_radius) //6378137 plus ou moins rayon de la terre (possibilités d'être plus précis)
}
module.exports = router