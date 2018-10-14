let express = require('express')
let User = require('../models/req_user')
let router = express.Router()

router.route('/secure_profile')
	.get((req, res) => {

     })
	.post((req, res) => {
		//console.log(req.body)
		let table = []
		let ret = {}
		for (k in req.body){
			table.push(req.body[k])
		}
		if (table.length == 1){
			req.session.id_u_temp = table[0]
			//req.session.id_u= table[0]
			ret.success = true
		}
		else
		{
			ret.success = false
			ret.msg = ["Erreur lors de la récupération du paramètre de la requète !"]
		}
		//console.log(req.session)
		res.send(ret)
})
module.exports = router;