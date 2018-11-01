const express = require('express')
const User = require('../models/req_user')

const router = express.Router()

router.route('/logout')
	.get((request, response) => {
		//response.locals.session = request.session
		response.render('pages/index')
	})
	.post((request, response) => {
		let table = [], ret = {}
		ret.global_msg = []
		ret.success = []
		for (let prop in request.body){
			table.push(request.body[prop])
		}
		if (table.length > 0){
			request.session.userId = null
			request.session.userName = null
			request.session.userFirstName = null
			request.session.userType = null
			ret.success.push(true)
			ret.global_msg.push('Session clos !')
		}else{
			ret.success.push(false)
			ret.global_msg.push('Erreur lors de la deconnexion de l\'utilisateur, contactez le support/modérateur !')
		}
		response.send(ret)
})
module.exports = router
