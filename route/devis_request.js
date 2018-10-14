let express = require('express')
let User = require('../models/req_user')

let router = express.Router()

router.route('/devis-request')
	.get((request, response) => {

	})
	.post((request, response) => {
		console.log(request.body);
		let table = [], tableT = [], tableM = [], tableS =[]
		let ret = {}
		ret.type_d = "devis_request"
		ret.created = new Date()
		ret.global_msg = []
		ret.success = []
		ret.result = {}
		for (let prop in request.body){
			table.push(request.body[prop])
		}
		ret.msg = table[0] != "" ? table[0] : "Aucun objet !"
		console.log(table)
		if (table.length > 4 && table[1] != ""){
			tableT.push('devis_request', null);
			User.insertTypeM(tableT, (result)=>{
				if (result > 0){
					tableM.push(table[2], table[3], ret.msg, table[4], result, ret.created);                       
					User.insertMessages(tableM, (result2)=>{
						if (result2 > 0){
							ret.id_message = result2
							ret.success.push(true)
							for (k in table[1]){
								tableS = []
								setTimeout((function(k, tableS) {
									return function (){
										tableS.push(result, table[1][k])
										User.insertServicesInTypeMessage(tableS, (result3)=>{
											if (result3 > 0){
												ret.success.push(true)
											}else{
												ret.success.push(false)
												ret.global_msg.push("Une erreur est survenue lors de l'envoi de la demande, veuillez contacter le support/modérateur !")
											}
										})
										if (k == table[1].length - 1){
											//console.log("last")
											//console.log(ret)
											//response.send(ret)
											get_services_with_libelles(response, result, ret)
										}
									};
								}) (k, tableS), 100);
							}
						}else{
							ret.success.push(false)
							ret.global_msg.push("Une erreur est survenue lors de l'envoi de la demande, veuillez contacter le support/modérateur !")
							response.send(ret)
						}
					})
				}else{
					ret.success.push(false)
					ret.global_msg.push("Une erreur est survenue lors de l'envoi de la demande, veuillez contacter le support/modérateur !")
					response.send(ret)
				}
			});
		}
		else{
			ret.success.push(false)
			ret.global_msg.push("Aucun service sélectionné !")
			response.send(ret)
		}
})
function get_services_with_libelles(response, id_type_M, ret){
	User.getServicesInTypeMessage(id_type_M, (result)=>{
		if (result.length > 0){
			ret.result.servs = []
			for (k in result){
				let serv = {}
				serv.id = result[k].id_service
				serv.libelle = result[k].nom_service
				ret.result.servs.push(serv)
			}
			if (k == result.length - 1){
				ret.success.push(true)
				response.send(ret)
			}
		}else{
			ret.success.push(false)
			ret.global_msg.push("Une erreur est survenue lors de la récupération des services liés au devis, veuillez contacter le support/modérateur !")
			response.send(ret)
		}
	})
}
module.exports = router