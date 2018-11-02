const express = require('express')
const User = require('../models/req_user')
const router = express.Router()

router.route('/get_all_cp')
	.post((request, response) => {
		//console.log(request.body)
		let ret = {}
		User.getAllFrenchCp((res) =>{
			ret.cp = res
			//console.log(ret)
			response.send(ret)
		})
	})

module.exports = router
