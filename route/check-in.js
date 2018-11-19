const express = require('express')
const User = require('../models/req_user')
const router = express.Router()
router.route('/check-in')
.post((request, response) => {
	//let id_user
	let ret = {}
	ret.success = []
	ret.global_msg = []
	ret.result = {}
	ret.msg = request.body.from == "rdv" || request.body.from == "rdv_offer" ? "Demande de rendez-vous !" : "Demande de booking !"
	ret.created = new Date()
	if (request.session.token == request.headers["x-access-token"]){
		var table = []
		//let tableD = [], tableT = [], tableTemp = [], tableE = [], tableM = []
		//let start, end, title, id_pro, id_art
		var len
		//let req_ok = '', req_ko = ''
		//var id_sender = request.body.user_sender,
		//title = request.body.title
		//id_receiv = request.body.user_receiv
		//id_pro = request.body.id_pro
		//id_art = request.body.id_art
		//console.log(request.body)
		for (var k in request.body){
			table.push(request.body[k])
		}
		//console.log(table)
		//INSERTION EVENNEMENT
		if (request.body.from == "rdv_offer"){
			len = (table.length - 12) / 2 ;
			insert_event(ret, request, len)
			.then((res) => {
				return insert_type_rdv_offer_message(request, res)
			})
			.then((res) => {
				return insert_events_in_tm(res)
			})
			.then((res) => {
				//console.log(res)
				return insert_message(request, res)
			})
			.then((res) => {
				//console.log(res)
				return tempo(request, res)
			})
			.then((res)=>{
				response.send(res)
			})
			.catch((err) => {
				console.log(err);
				response.send(err)
			});
		}else{	
			len = (table.length - 7) / 2 ;
			insert_event(request, ret, len)
			.then((res) => {
				return insert_type_rdv_message(request, res)
			})
			.then((res) => {
				return insert_events_in_tm(res)
			})
			.then((res) => {
				return insert_message(request, res)
			})
			.then((res) => {
				//console.log(res)
				return tempo(request, res)
			})
			.then((res)=>{
				response.send(res)
			}).catch((err) => {
				//console.log(err);
				response.send(err)
			});
		}
		if (len == 0){
			//Aucune date select
			ret.success.push(false)
			ret.global_msg.push("Aucun créneau horaire sélectionné !")
			//console.log("Echec select event !")
			response.send(ret)
		}
	}else{
		ret.success.push(false)
		ret.global_msg.push("Token compromised !")
		response.send(ret)
	}
})
function insert_event(req, ret, len){
	return new Promise((resolve, reject) =>{
		//console.log(request.body);
		for (var k=0; k < len; k++){
			ret.result.id_dispos = []
			setTimeout((function(k) {
				return function(){
					var tableD = [],
					start = req.body["events["+k+"][start]"],
					end = req.body["events["+k+"][end]"];
					//console.log(k);
					//console.log(start);
					//console.log(end);
					tableD.push(req.body.id_pro, req.body.id_art, start, end, req.body.title, 0);
					User.insertDisponibiliteTemp(tableD, (result)=>{
						if (result > 0){
							ret.result.id_dispos.push(result)
							ret.success.push(true)
							ret.global_msg.push("Evènement envoyé !")
							//console.log("Success Insertion table calendar_event !")
						}
						else
						{
							ret.success.push(false)
							ret.global_msg.push("Erreur lors de l'enregistrement de l'évènement, contactez le support/modérateur !")
							//console.log("Echec Insertion table calendar_event !")
							reject(ret)
						}
						if (k == len - 1){
							//messages in chat
							ret.result.type_r = req.body.from
							//insert_message(request, response, ret.result.id_dispos, ret);
							//response.send(ret)
							resolve(ret)
						}
					});
				};
			}) (k), 100);
		}
	});
}
function insert_type_rdv_offer_message(req, ret){
	return new Promise((resolve) => {
		var tableT = []
		//INSERTION TYPEMESSAGE
		tableT.push("rdv_offer", req.body["offer[id]"])
		if (ret.result.id_dispos.length > 0){
			User.insertTypeOM(tableT, (result)=>{
				if (result > 0){
					ret.success.push(true)
					ret.global_msg.push("Type du message inséré !")
					ret.result.id_type_m = result
					resolve (ret)
					// for (var k in ret.result.id_dispos){
					// 	setTimeout((function(k) {
					// 		return function (){		
					// 			let tableE = []
					// 			let id = ret.result.id_dispos[k]
					// 			tempo(req, result, id, ret)
					// 			tableE.push(id, result)
					// 			User.insertEventsInTypeMessage(tableE, (result2)=>{
					// 				if (result2 > 0){
					// 					ret.success.push(true)
					// 				}
					// 				else{
					// 					ret.success.push(false)
					// 					ret.global_msg.push("Une erreur est survenue lors l'insertion du type du message, veuillez contacter le support/modérateur !")
					// 				}
					// 			});
					// 			//Dernière élement du tableau
					// 			if (k == ret.result.id_dispos.length - 1){
					// 				resolve(ret)
					// 			}
					// 		};
					// 	}) (k), 100);
					// }
				}else{
					ret.success.push(false)
					ret.global_msg.push("Une erreur est survenue lors de l'insertion du type de message, contactez le support/modérateur !")
					//response.send(ret)
					throw ret
				}
			});
		}else{
			ret.success.push(false)
			ret.global_msg.push("Aucun évènnement à insérer dans le type du message !")
			//response.send(ret)
			throw ret
		}
	})
}
function insert_type_rdv_message(req, ret){
	return new Promise((resolve) => {
		var tableT = []
		//INSERTION TYPEMESSAGE PUIS MESSAGE
		tableT.push(req.body.from, null)
		if (ret.result.id_dispos.length > 0){
			User.insertTypeM(tableT, (result)=>{
				if (result > 0){
					ret.success.push(true)
					ret.result.id_type_m = result
					ret.global_msg.push("Type du message inséré !")
					resolve(ret)
					// for (var k in ret.result.id_dispos){
					// 	setTimeout((function(k) {
					// 		return function (){		
					// 			let tableE = []
					// 			let id = ret.result.id_dispos[k]
					// 			tempo(req, result, id, ret)
					// 			tableE.push(id, result)
					// 			User.insertEventsInTypeMessage(tableE, (result2)=>{
					// 				if (result2 > 0){
					// 					ret.success.push(true)
					// 				}
					// 				else{
					// 					ret.success.push(false)
					// 					ret.global_msg.push("Une erreur est survenue lors l'insertion du type du message, veuillez contacter le support/modérateur !")
					// 				}
					// 			});
					// 			//Dernière élement du tableau
					// 			if (k == ret.result.id_dispos.length - 1){
					// 				resolve(ret)
					// 			}
					// 		};
					// 	}) (k), 100);
					// }
				}else{
					ret.success.push(false)
					ret.global_msg.push("Une erreur est survenue lors de l'insertion du type de message, contactez le support/modérateur !")
					//response.send(ret)
					throw ret
				}
			});
		}else{
			ret.success.push(false)
			ret.global_msg.push("Aucun évènnement à insérer dans le type du message !")
			//response.send(ret)
			throw ret
		}
	})
}
function insert_events_in_tm(ret){
	return new Promise((resolve) => {
		if (ret.result.id_dispos.length > 0){
			for (var k in ret.result.id_dispos){	
				let tableE = []
				let id = ret.result.id_dispos[k]
				//tempo(request, result, id, ret)
				tableE.push(id, ret.result.id_type_m)
				User.insertEventsInTypeMessage(tableE, (result)=>{
					if (result > 0){
						ret.success.push(true)
						ret.global_msg.push("Evennement inséré dans le type du messages !")
					}else{
						ret.success.push(false)
						ret.global_msg.push("Une erreur est survenue lors l'insertion des évènnements du type du message, veuillez contacter le support/modérateur !")
						throw ret
					}
				});
				//Dernière élement du tableau
				if (k == ret.result.id_dispos.length - 1){
					resolve(ret)
				}
			}
		}else{
			ret.success.push(false)
			ret.global_msg.push("Aucun évènnement à insérer !")
			throw ret
		}
	})
}
function insert_message(request, ret){
	//console.log(result)
	return new Promise((resolve, reject) => {
		var tableM = []
		tableM.push(request.body.user_sender, request.body.user_receiv, ret.msg, request.body.room, ret.result.id_type_m, ret.created);
		User.insertMessages(tableM, (result2) => {
			if (result2 > 0){
				ret.id_m = result2
				//io.sockets.in(socket.room).emit('updatechat', user_receiver, data)
				ret.success.push(true)
				ret.global_msg.push("Message envoyé !")
				//console.log("ENVOI DU MESSAGE AUDIO AU CALME !")
				//console.log(result)
				resolve(ret)
			}else{
				ret.success.push(false)
				ret.global_msg.push("Une erreur est survenue lors l'insertion du message, veuillez contacter le support/modérateur !")
				//console.log("ECHEC ENVOI DU MESSAGE !")
				//console.log(result)
				reject(ret)
			}
			//response.send(ret)
		})
	})
}
function tempo(req, ret){
	//TEMPOSRISATION
	let req_ok, req_ko, tableTemp = []
	return new Promise((resolve) => {
		if (ret.result.id_dispos.length > 0){
			ret.result.id_t = []
			req_ok = null
			req_ko = 'DELETE FROM `type_message` WHERE `type_message`.`id_type_m`='+ret.result.id_type_m
			tableTemp.push(req_ok, req_ko, req.body.user_receiv, req.body.user_sender, ret.result.id_type_m)
			User.insertTemp(tableTemp, (result)=>{
				if (result > 0){
					ret.success.push(true)
					ret.result.id_t.push(result)
					ret.global_msg.push("Temporisation insérée !")
					//console.log("Success Insertion table temp !")
				}else{
					ret.success.push(false)
					ret.global_msg.push("Echec lors de l'insertion de la temporisation !")
					throw ret
				}
			});
			for (var k in ret.result.id_dispos){
				tableTemp = []
				req_ok = 'UPDATE `calendar_event` SET `calendar_event`.`acceptation`=1 WHERE `calendar_event`.`id_event`='+ret.result.id_dispos[k]
				req_ko = 'DELETE FROM `calendar_event` WHERE `calendar_event`.`id_event`='+ret.result.id_dispos[k]
				tableTemp.push(req_ok, req_ko, req.body.user_receiv, req.body.user_sender, ret.result.id_type_m)
				User.insertTemp(tableTemp, (result)=>{
					if (result > 0){
						ret.success.push(true)
						ret.result.id_t.push(result)
						ret.global_msg.push("Temporisation insérée !")
						//console.log("Success Insertion table temp !")
					}else{
						ret.success.push(false)
						ret.global_msg.push("Echec lors de l'insertion de la temporisation !")
						throw ret
					}
					if (k == ret.result.id_dispos.length - 1){
						resolve (ret)
					}
				});
			}
		}else{
			ret.success.push(false)
			ret.global_msg.push("Aucun évènnement à ajouter dans la temporisation !")
			throw ret
		}
	})
}
module.exports = router
