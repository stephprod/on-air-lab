const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()
//const User = require('../models/req_user')

router.route('/payment')
    .get((req, res) => {
        console.log(req.query)
        res.locals.session = req.session
        
            // asynchronously called
            // console.log("source : ")
            // console.log(source)
            stripe.customers.create({
                description: `pro prenom : ${req.session.userFirstName} nom : ${req.session.userName}`,
                //  source: req.query.source
            }, function(err, customer) {
                console.log("customer : ")
                console.log(customer)
                console.log(err)
                stripe.sources.create({
                    customer: customer.id,
                    usage: "reusable",
                    original_source: req.query.source
                  }, {stripe_account: "acct_1DRMyYF3bBDlm6dH",}).then(function(token) {
                    console.log("source :")
                      console.log(token)
                      console.log(err)
                    stripe.plans.create({
                        amount: 145,
                        interval: "month",
                        product: {
                        name: "Gold special"
                        },
                        currency: "eur",
                    }, function(err, plan) {
                        console.log(err)
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
                                console.log(err)
                                res.render('pages/info-pro2')
                            });
                    });
                });                    
            })
        //res.render('pages/info-pro2')
    })
	.post((req, res) => {
        //console.log(req.headers);
        //if (req.session.token == req.headers["x-access-token"]){
            // stripe.tokens.retrieve(req.body.stripeToken, (err, token) => {
            //     console.log(err)
            //     console.log(token)
            // })
            stripe.customers.create({
                description: `pro prenom : ${req.body.prenom} nom : ${req.body.nom}`,
                source: req.body.stripeToken
            }, function(err, customer) {
                    console.log("customer : ")
                    console.log(customer)
                    console.log(err)
                        // asynchronously called
                        stripe.plans.create({
                            amount: parseFloat(req.body.price),
                            interval: "month",
                            product: {
                            name: "Gold special"
                            },
                            currency: "eur",
                        }, function(err, plan) {
                            console.log(err)
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
                                    console.log(err)
                                    res.end()
                                });
                        });
                    });
        // }else{
        //     console.log("Token compromised !")
        //     res.end()
        // }
});
module.exports = router