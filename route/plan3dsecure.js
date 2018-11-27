const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()

router.route('/plan3dsecure')
    .get((req, res) => {
                    stripe.plans.create({
                        amount: 145,
                        interval: "month",
                        product: {
                        name: "Gold special"
                        },
                        currency: "eur",
                        trial_period_days: 30,
                    }, function(err, plan) {
                        console.log(err)
                        console.log("plan : ")
                        console.log(plan);
                        stripe.subscriptions.create({
                            customer: req.query.cust,
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
    })

    module.exports = router