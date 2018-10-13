*-*let express = require('express')
let User = require('../models/req_user')
let session = require('express-session');
let router = express.Router()

router.route('/widget-search')
	.get((request, response) => {
		//if (request.session.userId == undefined) {
		//	response.render('pages/index', {name: "index"})
		//}else{
			response.render('pages/widget_search', {user : request.session})
		//}
		//console.log("ID du GARS "+request.session.userId)
        //console.log("NOM du GARS "+request.session.userName)
	})
	.post((request, response) => {
})
module.exports = router