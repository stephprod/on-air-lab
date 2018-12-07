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
            let webh_res = JSON.parse(req.body)
            console.log(webh_res)
            manage_event_response(webh_res, res)
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
    if(parseInt(two.t) < 10000000000) 
        two.t += "000"
    diffs_in_timestmp = date.getTime() - parseInt(two.t);
    // console.log(parseInt(two.t+"000"));
    // console.log(date.getTime());
    // console.log(Math.abs(diffs_in_timestmp));
    if (Math.abs(diffs_in_timestmp) > delta_in_ms)
        return diffs_in_timestmp;
    else
        return true;
    // --//
}
function manage_event_response(wh_datas, response){
    if (wh_datas.type.indexOf("payment_intent") !== -1)
        payment_intent_responses(wh_datas, response)
    else if (wh_datas.type.indexOf("charge") !== -1)
        charge_responses(wh_datas, response)
}
function charge_responses(wh_datas, resp){
    get_user_in_event(wh_datas.data.object.source.owner.name)
    .then((user) => {
        if (wh_datas.type == "charge.succeeded"){
            return send_notification(user, wh_datas.data.object.amount, resp, "accept")
            .then(() => {
                insert_new_abo(resp, "valide", wh_datas, user)
            })
        }else{
            return send_notification(user, wh_datas.data.object.amount, resp, "deny")
            .then(() => {
                insert_new_abo(resp, "annule", wh_datas, user)
            })
        }
    })
}
function payment_intent_responses(wh_datas, resp){
    if (wh_datas.type != "payment_intent.created"){
        get_user_in_event(wh_datas.data.object.charges.data[0].source.owner.email).then((user) => {
            if (wh_datas.type == "payment_intent.succeeded"){
                return send_notification(user, wh_datas.data.object.amount, resp, "accept")
                .then(() => {
                    insert_new_payment(resp, "valide", wh_datas, user)
                })
            }else{
                return send_notification(user, wh_datas.data.object.amount, resp, "deny")
                .then(() => {
                    insert_new_payment(resp, "annule", wh_datas, user)
                })
            }
        })
    }else{
        resp.status(200).send({received: true})
    }
}
function send_notification(userDest, amount, resp, action){
    return notifications.webhook_payment_mail(userDest, "payment_intent", action, (amount/100))
    .catch((err) => console.log(err))
}

function insert_new_payment(resp, action, wh_datas, user_from){
    let table = [], dateInMilis = parseInt(wh_datas.data.object.created), id_pro, amount = 0
    id_pro = wh_datas.data.object.statement_descriptor.split(" ")[1]
    if(dateInMilis < 10000000000) 
        dateInMilis *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
    amount = parseFloat(wh_datas.data.object.amount) / 100
    table.push("PRESTATION", action, wh_datas.data.object.description, id_pro, user_from.id, amount, new Date(dateInMilis))
    User.create_payment(table, (result, resolve, reject) => {
        let valid = result.changedRows != 0 ? result.changedRows : result.affectedRows
        if (valid > 0){
            resolve()
        }else{
            reject(new Error("Insertion du paiement echouée !"))
        }
    }).then(() => {
        resp.status(200).send({received: true})
    }, (err) => {
        resp.status(500).send({received: true, error: err})
    })
}
function insert_new_abo(resp, action, wh_datas, user_from){
    let table = [], dateInMilis = parseInt(wh_datas.data.object.created), amount = 0
    if(dateInMilis < 10000000000) 
        dateInMilis *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
    amount = parseFloat(wh_datas.data.object.amount) / 100
    table.push("ABONNEMENT", action, "Nouvelle abonnement LabelOnAir", user_from.id, amount, new Date(dateInMilis))
    User.create_payment_abo(table, (result, resolve, reject) => {
        let valid = result.changedRows != 0 ? result.changedRows : result.affectedRows
        if (valid > 0){
            resolve()
        }else{
            reject(new Error("Insertion de l'abonnement echouée !"))
        }
    }).then(() => {
        resp.status(200).send({received: true})
    }, (err) => {
        resp.status(500).send({received: true, error: err})
    })
}
function get_user_in_event(user_mail){
    return new Promise((resolve, reject) => {
        User.getUser('WHERE `user`.`email`="'+user_mail+'"', (result) => {
            if (result !== undefined){
                resolve (result)
            }else{
                reject (new Error("Utilisateur non récupéré !"))
            }
        })
    })
}

module.exports = router