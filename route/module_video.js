*-*let express = require('express')
let validator = require('../middlewares/valid_form').module_video
let User = require('../models/req_user')
let router = express.Router()

router.route('/module_video')
	.post(validator, (request, response) => {
		console.log(request.body)
		let table = []
		for (let prop in request.body){		
			table.push(request.body[prop])
		}
		console.log(table)
		let ret = {}
		ret.path = table[1]
		ret.success = []
		ret.global_msg = []
		ret.global_msg.push("Vidéo enregistrée !")
		ret.msg = table[0] != "" ? table[0] : "Aucun objet !"
		ret.type_v = 'video'
		ret.success.push(true)
		response.send(ret)
	})
module.exports = router