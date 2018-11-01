const express = require('express')
const User = require('../models/req_user')
const fs = require('fs');
//let fileUpload = require('express-fileupload')
const router = express.Router()

router.route('/delete-in-serv')
	.get((request, response) => {

	})
	.post((request, response) => {
		let table = [], ret = {}
		console.log(request.body)
		var file = ""
		var file_profileId = request.body.file_profileId
		table.push(file_profileId)
		User.get_document(table, (res) => {
			if (res.length > 0){
				for (i in res) {
					file = res[i].path.replace("/asset", "public")
					setTimeout((function(i, file) {
					 	return function(){
					 		//console.log("h "+file)
					 		fs.access(file, fs.constants.F_OK, (err) => {
								if (!err){
									//console.log(file)
									// Assuming that 'file' is a regular file.
									fs.unlink(file, (err) => {
									  if (err)
									  	throw err
									  console.log(file+' was deleted');
									})
								}
							  	//console.log(`${file} ${err ? 'does not exist' : 'exists'}`);
							})
							if (i == res.length - 1){
								ret.success = true
								response.send(ret)
							}
					 	};
					 }) (i, file), 100)
				}
			}
			else{
				ret.success = false
				response.send(ret)
			}
		})
	})
module.exports = router
