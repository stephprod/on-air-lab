const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()
const User = require('../models/req_user')
const uid = require('rand-token').uid

router.route('/payment')
    .get((req, res) => {
        res.locals.session = req.session 
        if (req.session.token === undefined)
            res.render('pages/index')
        else
            res.render('pages/payment')
    })
	.post((req, res) => {
        //console.log(req.headers);
        if (req.session.token == req.headers["x-access-token"]){
            var new_tok = uid(16);
            stripe.customers.create({
                description: 'Customer for jenny.rosen@example.com'
                //source: req.body.stripeToken
            }, function(err, customer) {
                    console.log("customer : ")
                    console.log(customer)
                    stripe.sources.create({
                        amount: 1099,
                        currency: "eur",
                        type: "three_d_secure",
                        three_d_secure: {
                          card: "src_19YP2AAHEMiOZZp1Di4rt1K6",
                        },
                        redirect: {
                          return_url: "https://shop.example.com/crtA6B28E1"
                        },
                      }, function(err, source) {
                        // asynchronously called
                        stripe.charges.create({
                            amount: 100,
                            currency: "eur",
                            customer: customer.id
                        }).then(function(charge) {
                            console.log("charge : ")
                            console.log(charge)
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
                                    let errors = {}
                                    ret.success = false
                                }
                                console.log(ret)   
                                res.end()
                            })
                      });
                        /*stripe.plans.create({
                            amount: 5000,
                            interval: "month",
                            product: {
                            name: "Gold special"
                            },
                            currency: "eur",
                        }, function(err, plan) {
                            console.log("plan : ")
                            console.log(plan);
                            stripe.subscriptions.create({
                                customer: customer.id,
                                items: [
                                {
                                    plan: plan.id,
                                },
                                ]
                                }, function(err, subscription) {
                                    console.log("subscription : ")
                                    console.log(subscription)
                                    res.end()
                                });
                        });*/
                    });
            });
        }else{
            console.log("Token compromised !")
            res.end()
        }
});
module.exports = router