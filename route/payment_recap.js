const express = require('express')
const User = require('../models/req_user')
const router = express.Router()

router.param('id', (req, res, next, token) => {
	req.session.id_u = token
	//console.log(req.session.id_u_temp)
	if (req.session.id_u == req.session.id_u_temp){
		User.getUser("id='"+token+"'", (res) => {
			if (res !== undefined && res){
				let obj = {}
				obj.id_coresp = res.id
				obj.nom = res.nom
				obj.prenom = res.prenom
				obj.type = res.type
				req.session.user_receiv = obj
			}
			next()
		})
	}
	else
	{
		res.status(404).send("Not found")
	}
})

router.route('/payment-recap/:id')
	.get((req, res) => {
		let paymentObj = []
        let userIdSender = req.session.userId
		let userIdReceiver = req.session.user_receiv.id_coresp
        res.locals.session = req.session
			res.render('pages/payment_recap', {page: "payment-recap"})
    })
	.post((req, res) => {
		//console.log(req.session.id_u)
})
module.exports = router;
