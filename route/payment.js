const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()

router.route('/payment')
    .get((req, res) => {
        if (req.session.token === undefined)
            req.session.token = makeid()
        res.locals.session = req.session 
        res.render('pages/payment')
    })
	.post((req, res) => {
        //console.log(req.headers);
        if (req.session.token == req.headers["x-access-token"]){
            stripe.customers.create({
                description: 'Customer for jenny.rosen@example.com',
                source: req.body.stripeToken
            }, function(err, customer) {
                    console.log("customer : ")
                    console.log(customer)
                    stripe.charges.create({
                        amount: 100,
                        currency: "eur",
                        customer: customer.id
                    }).then(function(charge) {
                        console.log("charge : ")
                        console.log(charge)
                        req.session.token = makeid()
                        res.end()
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
            console.log("Hacker vas-t'en !")
            res.end()
        }
});
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
module.exports = router