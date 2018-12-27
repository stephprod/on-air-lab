const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()

router.route('/plan3dsecure')
    .get((req, res) => {
        //console.log(req.query)
        stripe.plans.create({
            amount: parseFloat(req.query.amount),
            interval: "month",
            product: "prod_E3Lh8uPFzCj9gs",
            currency: "eur"
        }, function(err, plan) {
            // console.log(err)
            // console.log("plan : ")
            // console.log(plan);
            stripe.customers.retrieve(req.query.cust,
            function(err, customer) {
                // asynchronously called
                stripe.sources.retrieve(customer.sources.data[0].id
                , function(err, source) {
                    //console.log(source.id)
                    stripe.sources.update(source.id, {
                        metadata: {plan_id: plan.id}
                    }, function(){
                        stripe.subscriptions.create({
                            customer: req.query.cust,
                            items: [
                                {
                                    plan: plan.id,
                                },
                            ]
                        }, function() {
                            // console.log("subscription : ")
                            // console.log(subscription)
                            // console.log(err)
                            // asynchronously called
                            res.redirect("/info-pro")
                        });
                    })
                });
            });
        })
    })

    module.exports = router