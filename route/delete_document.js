*-*let express = require('express')
let User = require('../models/req_user')
let fs = require('fs');
//let fileUpload = require('express-fileupload')
let router = express.Router()

router.route('/delete-files')
	.get((request, response) => {
		
	})
	.post((request, response) => {
		let table = [], ret = {}
		console.log(request.body)
		table.push(request.body.file_profileId)
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