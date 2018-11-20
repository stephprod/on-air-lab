const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()
const User = require('../models/req_user')
const uid = require('rand-token').uid

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

router.route('/payment-module/:id')
    .get((req, res) => {
        var obj = {}
        res.locals.session = req.session 
        if (req.session.token !== undefined && req.query.id_type_m !== undefined){
            User.get_payment_in_tm(req.query.id_type_m, (result, resolve, reject) =>{
                if (result.length > 0){
                    resolve(result)
                }else{
                    reject()
                }
            }).then((resu) => {
                obj = resu
                res.render('pages/payment_module', {paymentObj: obj})
            }, () => {
                obj = null
                res.render('pages/payment_module', {paymentObj: obj})
            })
        }else{
            res.end()
        }
    })
	.post((req, res) => {
        //console.log(req.headers);
        //console.log(req.body);
        if (req.session.token == req.headers["x-access-token"]){
            var new_tok = uid(16);
            // stripe.customers.create({
            //     description: req.body.paymentDesc+' from '+req.body.paymentSrc+' for '+req.body.paymentDest,
            //     //source: req.body.stripeToken
            // }, function(err, customer) {
                //console.log("customer : ")
                console.log(req.body.stripeToken)
                stripe.sources.create({
                    amount: parseFloat(req.body.paymentPrice * 100),
                    currency: "eur",
                    type: "three_d_secure",
                    three_d_secure: {
                      card: req.body.stripeToken,
                    },
                    redirect: {
                      return_url: "https://shop.example.com/crtA6B28E1"
                    },
                }, function(err, source) {
                    console.log(source.id)
                    if (source.status == "chargeable"){
                        //Card ne supportant pas le 3DSecure
                    }
                    stripe.charges.create({
                        amount: parseFloat(req.body.paymentPrice * 100),
                        currency: "eur",
                        source: source.id,
                        description: req.body.paymentDesc+' from '+req.body.paymentSrc+' for '+req.body.paymentDest,
                        //customer: customer.id
                    }).then(function(charge) {
                        //console.log("charge : ")
                        //console.log(charge)
                        User.updateUser("jeton='"+new_tok+"' WHERE jeton='"+req.session.token+"'"
                        , (result) => {
                            let ret = {}
                            if (result > 0)
                            {
                                req.session.token = new_tok
                                ret.msg = ["Mot de passe mis à jour avec succés !"]
                                ret.success = true
                            }
                            else
                            {
                                //let errors = {}
                                ret.success = false
                            }
                            //console.log(ret)   
                            res.end()
                        })
                    });
                });
            //});
        }else{
            console.log("Token compromised !")
            res.end()
        }
});
module.exports = router