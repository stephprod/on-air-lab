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
		if (request.session.token == request.headers["x-access-token"]){
			for (let prop in request.body){
				table.push(request.body[prop])
			}
			if (table.length > 0){
				User.updateUser("disponibilite='0' WHERE id='"+request.session.userId+"'"
					, () => {
						request.session.userId = null
						request.session.userName = null
						request.session.userFirstName = null
						request.session.userType = null
						request.session.token = null
						request.session.userMail = null
						if (request.session.abonnement !== undefined)
							request.session.abonnement = null
						console.log('le champs Disponible est actuellement a 0')
						ret.success.push(true)
						ret.global_msg.push('Session clos !')
						response.send(ret)
					})
			}else{
				ret.success.push(false)
				ret.global_msg.push('Erreur lors de la deconnexion de l\'utilisateur, contactez le support/modérateur !')
				response.send(ret)
			}
		}else{
			ret.success.push(false)
			ret.global_msg.push("Token compromised !")
			response.send(ret)
		}
})
module.exports = router
