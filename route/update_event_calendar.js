const express = require('express')
const User = require('../models/req_user')

const router = express.Router()

router.route('/update_event_calendar')
	.post((request, response) => {
		let start = request.body.start;
		let end = request.body.end;
		let id = request.body.id;
		let ret = {}
		ret.success = []
		ret.global_msg = []
		if (request.session.token == request.headers["x-access-token"]){
			User.update_calendar(start, end, id, (result) => {
				if (result == 0) {
					ret.global_msg.push("Aucune mise à jour effectuée !")
				}else{
					ret.global_msg.push("Mise à jour effectuée avec succès !")
				}
				ret.res = result
				ret.success.push(true)
				response.send(ret)
			})
		}else{
			ret.success.push(false)
			ret.global_msg.push("Session compromise !")
			response.send(ret)
		}
	})

module.exports = router
