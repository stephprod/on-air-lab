*-*let express = require('express')
let validator = require('../middlewares/valid_form').module_apointment
let User = require('../models/req_user')
let router = express.Router()

router.route('/module_apointment')
	/*.get((request, response) => {
		response.render('pages/forgottenPassword')
	})*/
	.post((request, response) => {
		//console.log(request.body)
		let table = []
		for (let prop in request.body){		
			table.push(request.body[prop])
		}
		console.log(table)
		let ret = {}
		//ret.type_v = "video"
		//switch(table[0]){
		//	case "youtube_video_url":
		//		ret.path = "https://youtube.com/embed/" + table[1]
		//		break;
		//	case "vimeo_video_url":
		//		ret.path = "https://vimeo.com/" + table[2]
		//		break;
		//	default:
		//		ret.path = "https://" + table[3]
		//		break;

		//}
		ret.type_r = "rdv"
		ret.msg = ['Rendez-vous envoyé']
		ret.date = table[0]
		ret.success = true
		response.send(ret)
	})
module.exports = router