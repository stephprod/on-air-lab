const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()
const User = require('../models/req_user')
const uid = require('rand-token').uid

router.param('id', (req, res, next, token) => {
	req.session.id_u = token
	//console.log(req.session.id_u_temp)
	//if (req.session.id_u == req.session.id_u_temp){
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
	// }
	// else
	// {
	// 	res.status(404).send("Not found")
	// }
})

router.route('/payment-module/:id')
    .get((req, res) => {
        let ret = {}
        res.locals.session = req.session
        //console.log(req.query)
        let new_tok = uid(16);
        let source = req.query.source.id !== undefined ? req.query.source.id : req.query.source
        stripe.sources.retrieve(
            source,
            function(err, source) {
                // asynchronously called
                //console.log("retreive source : ")
                //console.log(source)
                if (source.status == "chargeable"){
                    stripe.charges.create({
                        amount: source.amount,
                        currency: "eur",
                        source: source.id
                    }).then(function(charge) {
                        //console.log("charge : ")
                        //console.log(charge)
                        User.updateUser("jeton='"+new_tok+"' WHERE jeton='"+req.session.token+"'"
                        , (result) => {
                            if (result > 0)
                            {
                                req.session.token = new_tok
                                ret.msg = ["Mot de passe mis à jour avec succés !"]
                                ret.success = true
                            }
                            else
                            {
                                let errors = {}
                                ret.success = false
                            }
                            //console.log(ret)
                            res.render('pages/payment_module', {srcObj: source, chargeObj: charge, result: ret})
                            //res.end()
                        })
                    }, function (error){
                        //console.log("charge : ")
                        //console.log(error)
                        ret.success = false
                        ret.msg = error.outcome.seller_message
                        //console.log(ret)
                        res.render('pages/payment_module', {srcObj: source, result: ret})
                    });
                }else if (source.status == "failed"){
                    //Ident. 3D secure failes
                    ret.success = false
                    ret.msg = "Identification 3DSecure échouée !"
                    //console.log(ret)
                    res.render('pages/payment_module', {srcObj: source, result: ret})
                }else if(source.status == "canceled" || source.status == "consumed"){
                    ret.success = false
                    ret.msg = "Opération annulée !"
                    //console.log(ret)
                    res.render('pages/payment_module', {srcObj: source, result: ret})
                }
            }
        );
        //res.render('pages/payment_module')
    });
module.exports = router