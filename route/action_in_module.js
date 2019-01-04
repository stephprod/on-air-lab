const express = require('express')
const User = require('../models/req_user')
//const session = require('express-session');
const router = express.Router()
const notifications = require('../models/notifications').actions

router.route('/action-in-module')
	.post((request, response) => {
		let ret = {}
		ret.success = []
		ret.global_msg = []
		ret.result = {}
		if (request.session.token == request.headers["x-access-token"]){
			//console.log(request.body);
			const table = []
			const receiver = { id: request.session.userId,
				nom: request.session.userName,
				prenom: request.session.userFirstName,
				type: request.session.userType,
				email: request.session.userMail,
				img_chat: request.session.img_chat,
			}
			for (const prop in request.body){
				table.push(request.body[prop])
			}
			//console.log(table)
			get_action(request, ret)
			.then((res) => {
				//console.log(res)
				return do_actions(request, res)
			}).then((res) => {
				//console.log(res)
				res.result.libelle = request.body.action
				res.result.events = []
				if (request.body.type_m == "contact_response" || request.body.type_m == "payment_response")
					return res
				else if (request.body.action == "accept")
					return get_events(request, res)
				else
					return res
			}).then((res) => {
				//console.log(res)
				return notifications.mail(res.result.actionForNotif, receiver, request.body.type_m, request.body.action, ret.result.events)
				.then((res) => {
					ret.notif = res
					response.send(ret)
				}, (err) => response.send(err))
			})
			.catch((err) => {
				//console.log("error -> "+err)
				response.send(err)
			})
		}else{
			ret.success.push(false)
			ret.global_msg.push("Token compromised !")
			response.send(ret)
		}
})
function get_action(req, ret){
	return new Promise((resolve) => {
		User.get_accept_action_module(req.body.id_type_message, (result) =>{
			if (result.length > 0){
				ret.result.actions = result
				ret.success.push(true)
				ret.global_msg.push("Récupération de l'action réussite !")
				resolve(ret)
			}else{
				ret.success.push(false)
				ret.global_msg.push("Impossible de récupérer l'action liée à la demande (demande expirée) !")
				throw ret;
			}
		})
	})
}
function do_actions(req, ret){
	const len = ret.result.actions.length
	//console.log(ret.result.actions)
	return new Promise((resolve) => {
		for (var k in ret.result.actions){
			let action
			//console.log(ret.result.actions[k])
			if (req.body.action == "accept")
				action = ret.result.actions[k].action_ok
			else
				action = ret.result.actions[k].action_ko
			//console.log("action -> "+action)
			if (action != null){
				User.do_action_in_module(action, (result, err) => {
					//console.log(result)
					const resOfAction = result.affectedRows == 0 ? result.changedRows : result.affectedRows
					// console.log("error -> ")
					// console.log(err)
					// console.log("resOfAction -> ")
					// console.log(resOfAction)
					if (resOfAction > 0){
						//ret.result.action = result
						ret.success.push(true)
						ret.global_msg.push("Action effectuée !")
						//resolve(ret)
					}else{
						//console.log("Action echouée !")
						ret.success.push(false)
						ret.global_msg.push("Action echouée !")
						throw ret
					}
					if (err)
						throw err
					if (k == len - 1){
						ret.result.actionForNotif = ret.result.actions[k]
						resolve(ret)
					}
				})
			}else{
				if (k == len - 1){
					ret.result.actionForNotif = ret.result.actions[k]
					resolve(ret)
				}
			}		
		}
	})
}
function get_events(req, ret){
	return new Promise((resolve) => {
		User.getEventsInTypeMessage(req.body.id_type_message, (result)=> {
			if (result.length > 0){
				ret.result.events = result
				ret.success.push(true)
				ret.global_msg.push("Evennements récupérés !")
				resolve(ret)
			}else{
				ret.success.push(false)
				ret.global_msg.push("Erreur lors de la récupération des évennements !")
				throw ret
			}
		})
	})
}
module.exports = router
