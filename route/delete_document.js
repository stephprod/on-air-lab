const express = require('express')
const User = require('../models/req_user')
const fs = require('fs');
const router = express.Router()

router.route('/delete-files')
	.get((request, response) => {

	})
	.post((request, response) => {
		let table = [], ret = {}
		console.log(request.body)
		table.push(request.body.file_profileId)
		table.push(request.body.path)
		User.delete_document(table, (res) => {
			if (res > 0){
				ret.success = true
			}
			else
			{
				ret.success = false
			}
			response.send(ret)
		})
	})
module.exports = router
