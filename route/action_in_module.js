let express = require('express')
let User = require('../models/req_user')
let session = require('express-session');
let router = express.Router()

router.route('/action-in-module')
	.get((request, response) => {
		/*//if (request.session.userId == undefined) {
		//	response.render('pages/index', {name: "index"})
		//}else{
			console.log(request.url)
			response.locals.session = request.session
			response.render('pages/chat2')
		//}
		console.log("ID du GARS "+request.session.userId)
        console.log("NOM du GARS "+request.session.userName)*/
	})
	.post((request, response) => {
		//console.log(request.body);
		let table = [], ret = {}
		ret.success = []
		ret.global_msg = []
		for (let prop in request.body){
			table.push(request.body[prop])
		}
		//console.log(table)
		if (table.length > 1){
			if (table[1] == "accept"){
				User.get_accept_action_module(table[0], (result) =>{
					if (result.length > 0){
						//console.log(result)
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
									})
									if (k == result.length - 1){
										response.send(ret)
									}
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
									})
									if (k == result.length - 1){
										response.send(ret)
									}
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