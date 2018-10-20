let express = require('express')
let User = require('../models/req_user')
//let validator = require('../middlewares/valid_form2').valid_profile
let router = express.Router()
//let fileUpload = require('express-fileupload')
//router.use(fileUpload({
//	limits: { fileSize: 50 * 1024 * 1024 }
//}))

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
        //console.log(req.session)
        //res.locals.id_u = req.session.id_u
        res.locals.session = req.session
		//User.displayPayment(userIdReceiver, (result) => {
        	//console.log(result)
       // 	paymentObj = result
			res.render('pages/payment_recap', {page: "payment-recap"})
        //})
        //console.log("ID du GARS "+req.session.userId)
        //console.log("NOM du GARS "+req.session.userName)
    })
	.post((req, res) => {
		//console.log(req.session.id_u)
})
module.exports = router;