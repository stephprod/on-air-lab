const express = require('express')
const validator = require('../middlewares/valid_form').module_apointment
const User = require('../models/req_user')
const router = express.Router()

router.route('/module_apointment')
	.post((request, response) => {
		//console.log(request.body)
		let table = []
		for (let prop in request.body){
			table.push(request.body[prop])
		}
		console.log(table)
		let ret = {}
		ret.type_r = "rdv"
		ret.msg = ['Rendez-vous envoyé']
		ret.date = table[0]
		ret.success = true
		response.send(ret)
	})
module.exports = router
