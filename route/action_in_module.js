const express = require('express')
const User = require('../models/req_user')
const session = require('express-session');
const router = express.Router()

router.route('/action-in-module')
	.get((request, response) => {
	})
	.post((request, response) => {
		//console.log(request.body);
		const table = []
		var ret = {}
		ret.success = []
		ret.global_msg = []
		ret.result = {}
		for (const prop in request.body){
			table.push(request.body[prop])
		}
		//console.log(table)
		if (table.length > 1){
			if (table[1] == "accept"){
				User.get_accept_action_module(table[0], (result) =>{
					if (result.length > 0){
						//console.log(result)
						const len = result.length
						//console.log(len)
						for (k in result){
							//Utilisation PROMISE A VENIR (FONCTION TEMPORAIRE)
							setTimeout((function(k) {
								return function (){
									//console.log(result[k])
									User.do_action_in_module(result[k].action_ok, (result2) => {
										if (result2.changedRows > 0){
											ret.success.push(true)
											ret.global_msg.push("action acceptation effectuée !")
										}else{
											ret.success.push(false)
											ret.global_msg.push("erreur lors de l'action d'acceptation !")
										}
										if (k == len - 1){
											//console.log(ret);
											User.getEventsInTypeMessage(table[0], (result3)=>{
												if (result3.length > 0){
													ret.result.events = result3
												}
												ret.result.libelle = "accept"
												response.send(ret)
											})
										}
									})
								};
							}) (k), 100)
							//***********************************************//
						}
					}else{
						ret.success.push(false)
						ret.global_msg.push("Message expiré !")
						response.send(ret)
					}
				})
			}
			else if (table[1] == "deny"){
				User.get_deny_action_module(table[0], (result) =>{
					if (result.length > 0){
						//console.log(result)
						const len = result.length
						for (k in result){
							//Utilisation PROMISE A VENIR (FONCTION TEMPORAIRE)
							setTimeout((function(k) {
								return function (){
									//console.log(result[k])
									User.do_action_in_module(result[k].action_ko, (result2) => {
										if (result2.affectedRows > 0){
											ret.success.push(true)
											ret.global_msg.push("action refus effectuée !")
										}else{
											ret.success.push(false)
											ret.global_msg.push("erreur lors de l'action de refus !")
										}
										if (k == len - 1){
											ret.result.libelle = "deny"
											ret.result.events = []
											response.send(ret)
										}
									})
								};
							}) (k), 100)
							//***********************************************//
						}
					}else{
						ret.success.push(false)
						ret.global_msg.push("Message expiré !")
						response.send(ret)
					}
				})
			}
		}else{
			ret.success.push(false)
			ret.global_msg.push("Paramètres incorrects !")
			response.send(ret)
		}
})
module.exports = router
