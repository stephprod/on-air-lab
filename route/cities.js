*-*let express = require('express')
let User = require('../models/req_user')
let router = express.Router()

router.route('/get_cities_in_cp')
	.get((request, response) => {

	})
	.post((request, response) => {
		//console.log(request.body)
		let ret = {}
		User.getFrenchCitiesInCp(request.body.code_p, (res) => {
			//console.log(res)
			ret.cities = res
			response.send(ret)
		})
	})

module.exports = router