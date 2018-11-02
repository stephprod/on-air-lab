const express = require('express')
const User = require('../models/req_user')

const router = express.Router()

router.route('/drop_event_calendar')
	.post((request, response) => {
		let ret = {}
		ret.success = []
		ret.global_msg = []
		if (request.session.token == request.request["x-access-token"]){
			//console.log("Delete id "+request.body.id)
			User.drop_calendar(request.body.id)
			ret.success.push(true)
			ret.global_msg("Evènement supprimé avec succès !")
			response.send(ret)
		}else{
			ret.success.push(false)
			ret.global_msg.push("Token compromised !")
			response.send(ret)
		}
	})

module.exports = router
