const express = require('express')
const User = require('../models/req_user')
const fs = require('fs');
const router = express.Router()

router.route('/delete-files')
	.get((request, response) => {

	})
	.post((request, response) => {
		let table = [], ret = {}
		ret.success = []
		ret.global_msg = []
		if (request.session.token ==  request.headers["x-access-token"]){
			//console.log(request.body)
			table.push(request.body.file_profileId)
			table.push(request.body.path)
			User.delete_document(table, (res) => {
				if (res > 0){
					ret.success.push(true)
					ret.global_msg.push("Image(s) supprimée(s)!")
				}
				else
				{
					ret.global_msg.push("Erreur lors de la suppression d'image(s) !")
					ret.success.push(false)
				}
				response.send(ret)
			})
		}else{
			ret.success.push(false)
			ret.global_msg.push("Session compromise !")
			response.send(ret)
		}
	})
module.exports = router
