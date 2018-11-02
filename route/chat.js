const express = require('express')
const User = require('../models/req_user')
const session = require('express-session');
const router = express.Router()

router.route('/chat')
	.get((request, response) => {
		response.locals.session = request.session
		response.render('pages/chat2')
	})
	.post((request, response) => {
		//console.log(request.body);
		let table = []
		for (let prop in request.body){
			table.push(request.body[prop])
		}
		request.session.id_coresp = table[2]
		request.session.coresp_type = table[3]
		response.end();
})
module.exports = router
