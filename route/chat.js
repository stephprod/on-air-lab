let express = require('express')
let User = require('../models/req_user')
let session = require('express-session');
let router = express.Router()

router.route('/chat')
	.get((request, response) => {
		//if (request.session.userId == undefined) {
		//	response.render('pages/index', {name: "index"})
		//}else{
			console.log(request.url)
			response.locals.session = request.session
			response.render('pages/chat2')
		//}
		console.log("ID du GARS "+request.session.userId)
        console.log("NOM du GARS "+request.session.userName)
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