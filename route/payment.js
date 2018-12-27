const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()
//const User = require('../models/req_user')

router.route('/payment')
    .get((req, res) => {
        //console.log(req.query)
        res.locals.session = req.session
        stripe.customers.create({
            description: `${req.session.userId} ${req.session.userFirstName} ${req.session.userName}`,
            source: req.query.source
        }, function(err, customer) {
            // console.log("customer : ")
            // console.log(customer)
            // console.log(err)
            res.send({customer : customer})                
        })
    })
	.post((req, res) => {
        let ret = {}
        ret.success = []
        ret.global_msg = []
        stripe.customers.create({
            description: `${req.session.userId} ${req.body.prenom} ${req.body.nom}`,
            source: req.body.stripeToken
        }, function(err, customer) {
            // console.log("customer : ")
            // console.log(customer)
            // console.log(err)
            // asynchronously called
            stripe.plans.create({
                amount: parseFloat(req.body.price),
                interval: "month",
                product: "prod_E3Lh8uPFzCj9gs",
                currency: "eur"
            }, function(err, plan) {
                // console.log(err)
                // console.log("plan : ")
                // console.log(plan);
                stripe.sources.update(req.body.stripeToken, {
                    metadata: {plan_id: plan.id}
                }, function(){
                    stripe.subscriptions.create({
                        customer: customer.id,
                        items: [{
                            plan: plan.id,
                        }]
                    }, function(err, subscription) {
                        // console.log("subscription : ")
                        // console.log(subscription)
                        // console.log(err)
                        // asynchronously called
                        if (err){
                            ret.success.push(false)
                            ret.global_msg.push("Une erreur est survenue lors de la création de l'abonnement ! (etape souscrition)")
                        }else{
                            ret.success.push(true)
                            ret.global_msg.push("La création de ton abonnement est en cours, tu devrais recevoir un mail de confirmation dans un délai de 1h maximum !", "A réception de ce mail tu devras te reconnecter pour que les changements soient effectifs !")
                        }
                        res.send(ret)
                    });
                });
            });
        });
    });
module.exports = router