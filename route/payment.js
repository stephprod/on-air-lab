const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()
//const User = require('../models/req_user')
const planId = "plan_EKskL7WtHXxDxK"

router.route('/payment')
    .get((req, res) => {
        //console.log(req.query)
        res.locals.session = req.session
        // create_stripe_account(req, req.query.accountToken)
        create_stripe_customer(req, req.query.source)
        .then((res0) => {
            res.send({customer : res0})
        }).catch((err) => {
            res.send({err : err.message})
        })
    })
	.post((req, res) => {
        let ret = {}
        ret.success = []
        ret.global_msg = []
        let cust, account
        create_stripe_customer(req, req.body.sourceId)
        .then((res0) => {
            cust = res0
            console.log("customer : ")
            // console.log(res0)
            return create_stripe_account(req, req.body.accountToken)
        })
        .then((res1) => {
            account = res1
            console.log("account : ")
            // console.log(res1)
            return update_stripe_source(req.body.sourceId, account.id, cust.id, req, "new_abo")
        })
        .then(() => {
            console.log("source with metadatas : ")
            // console.log(res2)
            return create_stripe_subscription(cust.id)
        })
        .then((res3) => {
            console.log("subscription created : ")
            // console.log(res3)
            return update_stripe_source(req.body.sourceId, account.id, cust.id, req, "recurring")
        })
        .then(() => {
            ret.success.push(true, true)
            ret.global_msg.push("La création de ton abonnement est en cours, tu devrais recevoir un mail de confirmation dans un délai de 1h maximum !", "A réception de ce mail tu devras te reconnecter pour que les changements soient effectifs !")
            res.send(ret)
        })
        .catch((err) => {
            console.log(err)
            ret.success.push(false)
            ret.global_msg.push("Une erreur est survenue lors de la création de l'abonnement !", err.message)
            res.send(ret)
        })
});
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
function create_stripe_customer(req, token){
    return new Promise((resolve, reject) => {
        stripe.customers.create({
            description: `${req.session.userId} ${req.session.userFirstName} ${req.session.userName}`,
            source: token,
            metadata: {
                userId: req.session.userId,
                userMail: req.session.userMail
            }
        }, function(err, customer) {
            // asynchronously called
            if (err){
                reject(err)
            }else{
                resolve(customer)
            }
        })
    })
}
function create_stripe_subscription(custId){
    return new Promise((resolve, reject) => {
        stripe.subscriptions.create({
            customer: custId,
            items: [{
                plan: planId,
            }]
        },
        function(err, subscription) {
            // asynchronously called
            if (err){
                reject(err)
            }else{
                resolve(subscription)
            }
        })
    })
}
function update_stripe_source(sourceId, accountId, customerId, req, action){
    return new Promise((resolve, reject) => {
        stripe.sources.update(sourceId, {
            metadata: {
                user_id: req.session.userId,
                plan_id: planId,
                account_id: accountId,
                customer_id: customerId,
                user_mail: req.session.userMail,
                action: action
            }
        }, function(err, source){
            // asynchronously called
            if (err){
                reject(err)
            }else{
                resolve(source)
            }
        })
    })
}
module.exports = router