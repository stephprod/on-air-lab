const express = require('express')
const User = require('../models/req_user')
const fs = require('fs');
const router = express.Router()

router.route('/delete-in-serv')
	.get((request, response) => {

	})
	.post((request, response) => {
		let table = [], ret = {}
		var file = ""
		var file_profileId = request.body.file_profileId
		var pathImg = request.body.path
		ret.success = []
		ret.global_msg = []
		if (request.session.token == request.headers["x-access-token"]){
			table.push(file_profileId)
			if (pathImg){
					file = pathImg.replace("/asset", "public")
					setTimeout((function(file) {
						return function(){
							fs.access(file, fs.constants.F_OK, (err) => {
								if (!err){
									fs.unlink(file, (err) => {
									if (err)
										throw err
									console.log(file+' was deleted');
									})
								}
							})
						};
					}) (file), 100)
					ret.success.push(true)
					response.send(ret)
			}
			else{
				ret.success.push(false)
				response.send(ret)
			}
		}else{
			ret.success.push(false)
			ret.global_msg.push("Session compromise !")
			response.send(ret)
		}
	})
module.exports = router
