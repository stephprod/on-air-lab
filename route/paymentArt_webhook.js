const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()
const notifications = require('../models/notifications').actions

router.route('/stripe-webhook')
	.post((req, res) => {
        let sig = req.headers["stripe-signature"];
        console.log("body")
        console.log(req.body)
        console.log(sig)
        console.log(endpointSecret)
        // if (req.body.type == "payment_intent.succeeded"){
        //     notifications.mail()
        // }else{

        // }
        //let event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
        //console.log(event);
        res.send({received: true})
});
module.exports = router