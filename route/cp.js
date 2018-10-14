let express = require('express')
let User = require('../models/req_user')
let router = express.Router()

router.route('/get_all_cp')
	.get((request, response) => {

	})
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