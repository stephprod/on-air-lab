const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()
const notifications = require('../models/notifications').actions
const CryptoJS = require("crypto-js");
const endpointSecret = 'whsec_3fYUTSbKwvaKxX3nW8UPre7OCyCeDcXK'
router.use(require('body-parser').raw({type: "*/*"}))
// Retrieve the raw body as a buffer and match all content types
router.route('/stripe-webhook')
	.post((req, res) => {
        let sig = req.headers["stripe-signature"];
        
        // console.log("body")
        // console.log(req.body)
        // console.log(req.headers)
        // console.log(sig)
        //console.log(endpointSecret)
        if (extract_and_check_signature(sig, req.body, 300000)){
            // if (req.body.type == "payment_intent.succeeded"){
            //     notifications.webhook_payment_mail()
            // }else{
                
            // }
            //let event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
            //console.log(event);
        }
        res.send({received: true})
});
function extract_and_check_signature(sig, body, delta_in_ms){
    //Split the header using ',' character.
    let one, two = {}, signed_payload, expected, diffs_in_timestmp
    one = sig.split(",")
    for (var k in one){
        let obj = one[k].split("=")
        if (obj.length == 2){
            two[obj[0]] = obj[1]
        }
    }
    //console.log(two)
    //Prepare signed_payload string
    signed_payload = two.t + '.' + body
    //console.log("Signed Payload String => "+signed_payload)
    //Determine the expected signature
    var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, endpointSecret)
    hmac.update(signed_payload); 
    //expected = CryptoJS.HmacSHA256(signed_payload, endpointSecret);
    expected = hmac.finalize();
    //console.log(expected)
    console.log(expected.toString())
    //Compare Signatures
    if (two.v1 != expected.toString())
        return false;
    let date = new Date();
    diffs_in_timestmp = date.getTime() - parseInt(two.t+"000");
    // console.log(parseInt(two.t+"000"));
    // console.log(date.getTime());
    // console.log(diffs_in_timestmp);
    if (diffs_in_timestmp > delta_in_ms)
        return false;
    else
        return true;
}
module.exports = router