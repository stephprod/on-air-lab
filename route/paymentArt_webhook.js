//const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()
const notifications = require('../models/notifications').actions
const CryptoJS = require("crypto-js");
const endpointSecret = 'whsec_X7hNnuFPvgx9XgV0Ti4MqBNmrzgJOefz'
const User = require('../models/req_user')
// Retrieve the raw body as a buffer and match all content types
router.use(require('body-parser').raw({type: "*/*"}))
router.route('/stripe-webhook')
	.post((req, res) => {
        let sig = req.headers["stripe-signature"];
        //Check valid stripe-signature of the request and the differences between request timestamp and
        //stripe-signature timestamp _(must be less than 1minute = 60000ms) to protect against timing attacks
        //let secu = extract_and_check_signature(sig, req.body, 60000)
        if (extract_and_check_signature(sig, req.body, 60000) === true){
            let data = JSON.parse(req.body)
            //console.log(data.data.object.charges.data[0])
            User.getUser('`user`.`email`="'+data.data.object.charges.data[0].source.owner.email+'"', (result) => {
                //console.log(result);
                if (data.type == "payment_intent.succeeded"){
                    notifications.webhook_payment_mail(result, "payment_intent", "accept", (data.data.object.amount/100))
                    .then((result2) => {
                        res.status(200).send({received: true})
                    }).catch((err) => console.log(err))
                }else{
                    notifications.webhook_payment_mail(result, "payment_intent", "deny", (data.data.object.amount/100))
                    .then((result2) => {
                        res.status(200).send({received: false})
                    }).catch((err) => console.log(err))
                }
                // console.log(JSON.parse(req.body))
                // console.log(req.body)
            })
        }else{
            res.status(500).send({received: false})
        }
});
function extract_and_check_signature(sig, body, delta_in_ms){
    //-- Split the header using ',' character.
    //console.log(sig)
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
    // --//
    //-- Determine the expected signature
    var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, endpointSecret)
    hmac.update(signed_payload);
    expected = hmac.finalize();
    // console.log(body)
    // console.log(two)
    // console.log(expected.toString())
    // --//
    //-- Compare Signatures
    if (two.v1 != expected.toString())
        return expected.toString();
    let date = new Date();
    diffs_in_timestmp = date.getTime() - parseInt(two.t+"000");
    // console.log(parseInt(two.t+"000"));
    // console.log(date.getTime());
    // console.log(Math.abs(diffs_in_timestmp));
    if (Math.abs(diffs_in_timestmp) > delta_in_ms)
        return diffs_in_timestmp;
    else
        return true;
    // --//
}
module.exports = router