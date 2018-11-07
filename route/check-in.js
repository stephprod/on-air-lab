const express = require('express')
const User = require('../models/req_user')
const router = express.Router()
router.route('/check-in')
	.post((request, response) => {
		let id_user
		let ret = {}
		ret.success = []
		ret.global_msg = []
		ret.result = {}
		ret.msg = request.body.from == "rdv" || request.body.from == "rdv_offer" ? "Demande de rendez-vous !" : "Demande de booking !"
		ret.created = new Date()
		if (request.session.token == request.headers["x-access-token"]){
			let table = [], tableD = [], tableT = [], tableTemp = [], tableE = [], tableM = []
			//let start, end, title, id_pro, id_art
			let len
			let req_ok = '', req_ko = ''
			id_sender = request.body.user_sender
			//title = request.body.title
			id_receiv = request.body.user_receiv
			//id_pro = request.body.id_pro
			//id_art = request.body.id_art
			//console.log(request.body)
			for (k in request.body){
				table.push(request.body[k])
			}
			//console.log(table)
			//INSERTION EVENNEMENT
			let promise;
			if (request.body.from == "rdv_offer"){
				len = (table.length - 12) / 2 ;
				promise = insert_event(len, table, ret, request)
				.then((res) => {
					return insert_type_rdv_offer_message(request, response, res.result.id_dispos, res)
				})
				.then((res) => {
					//console.log(res)
					return insert_message(request, res, res.type_mess_id)
				}).then((res)=>{
					response.send(res)
				})
				.catch((err) => {
					console.log(err);
					response.send(err)
				});
			}else{	
				len = (table.length - 7) / 2 ;
				promise = insert_event(len, table, ret, request)
				.then(insert_type_rdv_message)
				.then(insert_message).then((res)=>{
					response.send(res)
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
	function insert_event(len, table, ret, request){
		return new Promise((resolve, reject) =>{
			//console.log(request.body);
			for (var k=0; k < len; k++){
				ret.result.id_dispos = []
				setTimeout((function(k) {
					return function(){
						var tableD = [],
						tableTemp = [],
						start = request.body["events["+k+"][start]"],
						end = request.body["events["+k+"][end]"];
						//console.log(k);
						//console.log(start);
						//console.log(end);
						tableD.push(request.body.id_pro, request.body.id_art, start, end, request.body.title, 0);
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
								ret.result.type_r = request.body.from
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
	function insert_type_rdv_offer_message(request, response, id_dispos, ret){
		return new Promise((resolve, reject) => {
			var tableT = []
			//INSERTION TYPEMESSAGE PUIS MESSAGE
			tableT.push("rdv_offer", request.body["offer[id]"])
			let dispos = id_dispos
			if (id_dispos.length > 0){
				User.insertTypeOM(tableT, (result)=>{
					if (result > 0){
						ret.success.push(true)
						ret.global_msg.push("Type du message inséré !")
						ret.type_mess_id = result
						for (k in id_dispos){
							setTimeout((function(k) {
								return function (){		
									let tableE = []
									let id = id_dispos[k]
									tempo(request, result, id, ret)
									tableE.push(id, result)
									User.insertEventsInTypeMessage(tableE, (result2)=>{
										if (result2 > 0){
											ret.success.push(true)
										}
										else{
											ret.success.push(false)
											ret.global_msg.push("Une erreur est survenue lors l'insertion du type du message, veuillez contacter le support/modérateur !")
										}
									});
									//Dernière élement du tableau
									if (k == id_dispos.length - 1){
										resolve(ret)
									}
								};
							}) (k), 100);
						}
					}else{
						ret.success.push(false)
						ret.global_msg.push("Une erreur est survenue lors de l'insertion du type de message, contactez le support/modérateur !")
						//response.send(ret)
						resolve(ret)
					}
				});
			}
		})
	}
	function insert_type_rdv_message(request, response, id_dispos, ret){
		return new Promise((resolve, reject) => {
			var tableT = []
			//INSERTION TYPEMESSAGE PUIS MESSAGE
			tableT.push(request.body.from, null)
			let dispos = id_dispos
			if (id_dispos.length > 0){
				User.insertTypeM(tableT, (result)=>{
					if (result > 0){
						ret.success.push(true)
						ret.type_mess_id = result
						ret.global_msg.push("Type du message inséré !")
						for (k in id_dispos){
							setTimeout((function(k) {
								return function (){		
									let tableE = []
									let id = id_dispos[k]
									tempo(request, result, id, ret)
									tableE.push(id, result)
									User.insertEventsInTypeMessage(tableE, (result2)=>{
										if (result2 > 0){
											ret.success.push(true)
										}
										else{
											ret.success.push(false)
											ret.global_msg.push("Une erreur est survenue lors l'insertion du type du message, veuillez contacter le support/modérateur !")
										}
									});
									//Dernière élement du tableau
									if (k == id_dispos.length - 1){
										resolve(ret)
									}
								};
							}) (k), 100);
						}
					}else{
						ret.success.push(false)
						ret.global_msg.push("Une erreur est survenue lors de l'insertion du type de message, contactez le support/modérateur !")
						//response.send(ret)
						resolve(ret)
					}
				});
			}
		})
	}
	function insert_message(request, ret, result){
		//console.log(result)
		return new Promise((resolve, reject) => {
			var tableM = []
			tableM.push(request.body.user_sender, request.body.user_receiv, ret.msg, request.body.room, result, ret.created);
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
	function tempo(request, type_id, id_dispo, ret){
		//TEMPOSRISATION
		var tableTemp = [],
		req_ok = 'UPDATE `calendar_event` SET `calendar_event`.`acceptation`=1 WHERE `calendar_event`.`id_event`='+id_dispo,
		req_ko = 'DELETE FROM `calendar_event` WHERE `calendar_event`.`id_event`='+id_dispo
		tableTemp.push(req_ok, req_ko, request.body.user_receiv, request.body.user_sender, type_id)
		User.insertTemp(tableTemp, (result)=>{
			if (result > 0){
				ret.success.push(true)
				ret.result.id_t = result
				//ret.global_msg.push("Evènement envoyé !")
				//console.log("Success Insertion table temp !")
			}
		});
	}
module.exports = router
