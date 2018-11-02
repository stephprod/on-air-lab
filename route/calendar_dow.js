const express = require('express')
const User = require('../models/req_user')

const router = express.Router()

router.route('/calendar_dow')
	.get((request, response) => {
		response.locals.session = request.session
		if (request.session.userId == undefined) {
			response.render('pages/index')
		}else{
			response.render('pages/calendar')
		}
	})
	.post((request, response) => {
		let table = [], ret = {}
		ret.success = []
		ret.global_msg = []
		//console.log(request.body)
		if (request.session.token == request.headers["x-access-token"]){
			table.push(request.session.userId)
			for (let prop in request.body){
				table.push(request.body[prop])
			}
			User.countDow(request.session.userId, (result) => {
				if (result == 1) {
					User.updateDow(table[1],table[2],table[3],table[4],table[5],table[6],table[7],table[8],table[0], (result) => {
						if (result > 0 ){
							ret.success.push(true)
							ret.global_msg.push("Mise à jour de l'agenda effectuée !")
						}
						else{
							ret.success.push(false)
							ret.global_msg.push("Echec de la mise à jour de l'agenda, contactez le support/modérateur !")
						}
						response.send(ret)
					})
				}else{
					User.insertDow(table, (result) => {
						if (result == 0){
							ret.success.push(false)
							ret.global_msg.push("Echec de la mise à jour de l'agenda (aucun changement à effectuer) !")
						}
						else{
							ret.success.push(true)
							ret.global_msg.push("Ajout de l'agenda effectué !")
						}
						response.send(ret)
					})
				}
			})
		}else{
			ret.success.push(false)
			ret.global_msg.push("Compromised token !")
			response.send(ret)
		}
	})

module.exports = router
