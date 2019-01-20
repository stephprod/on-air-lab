//const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()
const notifications = require('../models/notifications').actions
const CryptoJS = require("crypto-js");
const random_code_gen = require('../models/code_gen').default
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
            //console.log(webh_res)
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
    if (wh_datas.type.indexOf("payment_intent") !== -1){
        payment_intent_responses(wh_datas, response)
        .then(() => {
            response.status(200).send({received: true})
        })
        .catch((err) => {
            response.status(500).send({received: true, error: err})
        })
    }else if (wh_datas.type.indexOf("charge") !== -1){
        charge_responses(wh_datas, response)
        .then(() => {
            response.status(200).send({received: true})
        })
        .catch((err) => {
            response.status(500).send({received: true, error: err})
        })
    }
    // else if (wh_datas.type.indexOf("customer") !== -1){
    //     customer_responses(wh_datas, response)
    //     .then(() => {
    //         response.status(200).send({received: true})
    //     })
    //     .catch((err) => {
    //         response.status(500).send({received: true, error: err})
    //     })
    // }
    else{
        response.status(200).send({received: true})
    }
}
function customer_responses(wh_datas, resp){
    // console.log(wh_datas)
    // return get_user_in_event(wh_datas.data.object.metadata.userMail)
    // .then((res) => {
    //     if (wh_datas.type == "customer.created"){
    //         //Mise à jour avec l'id du customer
    //     }
    // })
}
function charge_responses(wh_datas, resp){
    //console.log(wh_datas.data.object.source)
    if (Object.keys(wh_datas.data.object.source.metadata).length > 0){
        return get_user_in_event(wh_datas.data.object.source.metadata.user_mail)
        .then((user) => {
                if (wh_datas.type == "charge.succeeded"){
                    send_notification(user, wh_datas.data.object.amount, "accept")
                    .then(() => {
                        insert_new_abo(resp, "valide", wh_datas, user)
                    })
                    .then(() => {
                        //console.log(wh_datas);
                        if (wh_datas.data.object.source.metadata.action == "new_abo"){
                            update_profil(wh_datas);
                        }else{
                            return new Promise((resolve) => {
                                resolve()
                            })
                        }
                    })
                    .catch((err) => err)
                }else if(wh_datas.type == "charge.failed"){
                    send_notification(user, wh_datas.data.object.amount, "deny")
                    .then(() => {
                        insert_new_abo(resp, "annule", wh_datas, user)
                    })
                }
                // else{

                // }
        })
    }else{
        return new Promise((resolve) => {
            resolve()
        });
    }
}
function payment_intent_responses(wh_datas, resp){
    if (wh_datas.type != "payment_intent.created"){
        return get_user_in_event(wh_datas.data.object.charges.data[0].source.owner.email).then((user) => {
            if (wh_datas.type == "payment_intent.succeeded"){
                insert_new_payment("en attente", wh_datas, user)
                    .then((res) => {
                        let hash = res.id + '-' + res.datePayment.to2DigitsString()
                        //console.log("HASH : "+hash)
                        random_code_gen.obj.convertBase(hash, random_code_gen.base12, random_code_gen.base54)
                        .then((code) => {
                            send_notification(user, wh_datas.data.object.amount, "accept", code)
                        })
                    })
            }else{
                return send_notification(user, wh_datas.data.object.amount, "deny")
                    .then(() => {
                        insert_new_payment("annule", wh_datas, user)
                    })
            }
        })
    }else{
        resp.status(200).send({received: true})
    }
}
function send_notification(userDest, amount, action, code = ''){
    return notifications.webhook_payment_mail(userDest, code, "payment_intent", action, (amount/100))
    .catch((err) => console.log(err))
}

function insert_new_payment(action, wh_datas, user_from){
    let table = [], dateInMilis = parseInt(wh_datas.data.object.created), id_pro, amount = 0
    id_pro = wh_datas.data.object.statement_descriptor.split(" ")[1]
    if(dateInMilis < 10000000000) 
        dateInMilis *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
    amount = parseFloat(wh_datas.data.object.amount) / 100
    table.push("PRESTATION", action, wh_datas.data.object.description, id_pro, user_from.id, amount, new Date(),"MOD", wh_datas.data.object.charges.data[0].id,
        wh_datas.data.object.charges.data[0].metadata.id_request)
        return User.create_payment(table, (result, resolve, reject) => {
            let valid = result.insertId
            if (valid > 0){
                let ret = {
                    datePayment: new Date(dateInMilis),
                    id: valid
                }
                resolve(ret)
            }else{
                reject(new Error("Insertion du paiement echouée !"))
            }
        })
}
function insert_new_abo(resp, action, wh_datas, user_from){
    let table = [], dateInMilis = parseInt(wh_datas.data.object.created), amount = 0
    if(dateInMilis < 10000000000) 
        dateInMilis *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
    amount = parseFloat(wh_datas.data.object.amount) / 100
    table.push("ABONNEMENT", action, "Nouvelle abonnement LabelOnAir", user_from.id, amount, new Date(dateInMilis), wh_datas.data.object.source.id)
    if (wh_datas.data.object.source.metadata.action == "new_abo"){
        return User.create_payment_abo(table, (result, resolve, reject) => {
            let valid = result.changedRows != 0 ? result.changedRows : result.affectedRows
            if (valid > 0){
                resolve()
            }else{
                reject(new Error("Insertion de l'abonnement echouée !"))
            }
        })
    }else{
        return User.update_payment_abo("SET `payments`.`source`='"+
            wh_datas.data.object.source.id+"' WHERE `payments`.`id_pro`="+
            wh_datas.data.object.source.metadata.user_id+" AND `payments`.`type_payment`='ABONNEMENT'", (res, resolve, reject) => {
                if (res.changedRows > 0){
                    resolve()
                }else{
                    reject(new Error("Mise à jour de l'abonnement echouée !"))
                }
            })
    }
}
function update_profil(wh_datas){
    //console.log(wh_datas.data.object.source)
    return User.update_profil("SET `profil`.`customer`='"+
        wh_datas.data.object.source.metadata.customer_id+
        "', `profil`.`account`='"+
        wh_datas.data.object.source.metadata.account_id
        +"', `profil`.`plan`='"+
        wh_datas.data.object.source.metadata.plan_id
        +"' WHERE `profil`.`id_user`="+
        wh_datas.data.object.source.metadata.user_id,
        (result, resolve, reject) =>{
            if (result.changedRows > 0){
                resolve()
            }else{
                reject(new Error("Mise à jour du profil echouée"))
            }
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
Date.prototype.to2DigitsString = function() {
    return this.getUTCHours().toString(10).padStart(2, '0') +
        this.getUTCDate().toString(10).padStart(2, '0') +
        (this.getUTCMonth() + 1).toString(10).padStart(2, '0') +
        this.getUTCFullYear().toString(10).substring(2);
};

module.exports = router