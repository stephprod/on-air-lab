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
		let paymentObj = {}
        let userIdSender = req.session.userId
		let userIdReceiver = req.session.user_receiv.id_coresp
        console.log(req.query)
        //res.locals.id_u = req.session.id_u
        res.locals.session = req.session
        // req.query.type
        if (req.query.type !== undefined && req.query.from !== undefined){
        	//console.log(req.query.type);
        	//console.log(req.query.from);
        	//Calcul du nombre d'h de booking reservées à faire
        	if (req.query.from == 'new-booking'){
        		paymentObj.type_service = req.query.type
        		paymentObj.events = req.query.events
        		User.getTarificationForDisplay(req.query.id_pro, (result)=>{
        			if (result.length > 0){
        				paymentObj.prix_h = result[0].prix_h
        				paymentObj.prix_min = result[0].prix_min
        				paymentObj.nbr_h_min = result[0].nbr_h_min
        			}
        			res.render('pages/payment_recap', {obj: paymentObj}) 
        		})
        	}else{

        	}
		//})
        //console.log("ID du GARS "+req.session.userId)
        //console.log("NOM du GARS "+req.session.userName)
    	}
    	else{
    		res.status(404).send("NOT FOUND !")
    	}
    })
	.post((req, res) => {
		//console.log(req.session.id_u)
})
module.exports = router;