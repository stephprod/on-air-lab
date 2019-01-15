const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()
const planId = "plan_EKskL7WtHXxDxK"

router.route('/plan3dsecure')
    .get((req, res) => {
        let src, account, ret = {}
        ret.success = []
        ret.global_msg = []
        retrieve_stripe_source(req.query.source)
        .then((res0) => {
            src = res0
            console.log("source for first charge : ")
            //console.log(res0)
            return attach_stripe_source_to_customer(src, req.query.cust)
        })
        .then(() =>{
            return create_stripe_account(req, req.query.accountToken)
        })
        .then((res2) => {
            account = res2
            console.log("account : ")
            //console.log(res2)
            return update_stripe_source(req, req.query.source, account.id, req.query.cust, "new_abo")
        })
        .then(() => {
            console.log("source for first charge with metadatas : ")
            //console.log(res3)
            return direct_charge_stripe_customer(req.query.cust, req.query.source, src.amount)
        })
        .then(() =>{
            console.log("charge : ")
            //console.log(res4)
            return retrieve_stripe_source(req.query.src)
        })
        .then(() => {
            console.log("source for subscription : ")
            //console.log(res5)
            return update_stripe_source(req, req.query.src, account.id, req.query.cust, "recurring")
        })
        .then((res5) => {
            src = res5
            console.log("source for subscription with metadatas : ")
            //console.log(res5)
            return update_default_stripe_source_to_customer(req.query.cust, src)
        })
        .then(() => {
            console.log("setting source for subscription to default : ")
            //console.log(res6)
            return create_stripe_subscription(req.query.cust)
        })
        .then(() => {
            console.log("subscription created : ")
            // console.log(res7)
            ret.success.push(true)
            ret.global_msg.push("La création de ton abonnement est en cours, tu devrais recevoir un mail de confirmation dans un délai de 1h maximum !", "A réception de ce mail tu devras te reconnecter pour que les changements soient effectifs !")
            res.redirect("/info-pro?datas_infoPro="+encodeURIComponent(JSON.stringify(ret)))
        })
        .catch((err) => {
            console.log(err)
            ret.success.push(false)
            ret.global_msg.push("Une erreur est survenue lors de la création du compte !", err.message)
            if (err.raw !== undefined)
                ret.global_msg.push(err.rawType+": "+err.raw.decline_code)
            res.redirect("/info-pro?datas_infoPro="+encodeURIComponent(JSON.stringify(ret)))
        })
})
function update_default_stripe_source_to_customer(custId, src){
    return new Promise((resolve, reject) =>{
        if (src.status != "failed"){
            stripe.customers.update(custId, {
                default_source: src.id
            },function (err, cust){
                if (err)
                    reject(err)
                else
                    resolve(cust)
            });
        }else{
            reject(new Error("Vérification 3DSecure echouée"))
        }
    });
}
function direct_charge_stripe_customer(custId, srcId, amount){
    return new Promise((resolve, reject) => {
        stripe.charges.create({
            amount: amount,
            currency: "eur",
            customer: custId,
            source: srcId,
          }, function(err, charge) {
            // asynchronously called
            if (err){
                reject(err)
            }else{
                resolve(charge)
            }
        });
    })
}
function create_stripe_account(req, token){
    return new Promise((resolve, reject) => {
        stripe.accounts.create({
            type: 'custom',
            country: 'FR',
            email: req.session.userMail,
            // business_url:,
            // business_logo:,
            // business_primary_color:,
            account_token: token
        }, function(err, account) {
            // asynchronously called
            if (err){
                reject(err)
            }else{
                resolve(account)
            }
        });
    });
}
function attach_stripe_source_to_customer(source, custId){
    return new Promise((resolve, reject) => {
        if (source.status != "failed"){
            stripe.customers.createSource(custId, {
                source: source.id
            }, function(err, src){
                if (err)
                    reject(err)
                else{
                    stripe.customers.update(custId, {
                        default_source: src.id
                    },function (err, cust){
                        if (err)
                            reject(err)
                        else
                            resolve(cust)
                    });
                }
            });
        }else{
            reject(new Error("Vérification 3DSecure echouée"))
        }
    })
}
function retrieve_stripe_source(srcId){
    return new Promise((resolve, reject) => {
        stripe.sources.retrieve(srcId
            , function(err, source) {
            // asynchronously called
            if (err){
                reject(new Error(err.message))
            }else{
                resolve(source)
            }
        })
    })
}
function update_stripe_source(req, sourceId, acctId, custId, action){
    return new Promise((resolve, reject) => {
        stripe.sources.update(sourceId, {
            metadata: {
                user_id: req.session.userId,
                plan_id: planId,
                account_id: acctId,
                customer_id: custId,
                user_mail: req.session.userMail,
                action: action

            }
        }, function(err, source){
            // asynchronously called
            if (err){
                reject(new Error(err.message))
            }else{
                resolve(source)
            }
        })
    })
}
function create_stripe_subscription(customerId){
    return new Promise((resolve, reject) => {
        stripe.subscriptions.create({
            customer: customerId,
            items: [{
                plan: planId,
            }],
            trial_period_days: 31
        },
        function(err, subscription) {
            // asynchronously called
            if (err){
                reject(err)
            }else{
                //console.log(subscription)
                resolve(subscription)
            }
        })
    })
}
module.exports = router