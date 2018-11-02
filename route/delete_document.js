const express = require('express')
const User = require('../models/req_user')
const fs = require('fs');
//let fileUpload = require('express-fileupload')
const router = express.Router()

router.route('/delete-files')
	.post((request, response) => {
		let table = [], ret = {}
		ret.success = []
		ret.global_msg = []
		//console.log(request.body)
		if (request.session.token == request.headers["x-access-token"]){
			table.push(request.body.file_profileId)
			User.delete_document(table, (res) => {
				if (res > 0){
					ret.success.push(true)
				}
				else
				{
					ret.success.push(false)
				}
				response.send(ret)
			})
		}else{
			ret.success.push(false)
			ret.global_msg.push("Compromised token !")
		}
	})
module.exports = router
