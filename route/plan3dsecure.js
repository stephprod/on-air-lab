const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()

router.route('/plan3dsecure')
    .get((req, res) => {
        let cust, account, ret = {}
        ret.success = []
        ret.global_msg = []
        //console.log(req.query)
        create_stripe_account(req, req.query.accountToken)
        .then((res0) => {
            account = res0
            // console.log("account : ")
            // console.log(res0)
            //return retrieve_stripe_customer(req)
            return create_stripe_customer(req, req.query.src)
        })
        .then((res1) =>{
            cust = res1
            // console.log("customer : ")
            // console.log(res1)
            return retrieve_stripe_source(req)
        }).then((res2) => {
            // console.log("source : ")
            // console.log(res2)
            return update_stripe_source(req, res2, account, cust)
        })
        .then((res3) => {
            // console.log("source : ")
            // console.log(res3)
            return create_stripe_subscription(cust)
        })
        .then(() => {
            ret.success.push(true)
            ret.global_msg.push("La création de ton abonnement est en cours, tu devrais recevoir un mail de confirmation dans un délai de 1h maximum !", "A réception de ce mail tu devras te reconnecter pour que les changements soient effectifs !")
            res.redirect("/info-pro?datas_infoPro="+encodeURIComponent(JSON.stringify(ret)))
        })
        .catch((err) => {
            //console.log(err)
            ret.success.push(false)
            ret.global_msg.push("Une erreur est survenue lors de la création du compte !", err.message)
            res.redirect("/info-pro?datas_infoPro="+encodeURIComponent(JSON.stringify(ret)))
        })
})
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
function retrieve_stripe_customer(req){
    return new Promise((resolve, reject) => {
        stripe.customers.retrieve(req.query.cust,
            function(err, customer) {
            // asynchronously called
            if (err){
                reject(err)
            }else{
                resolve(customer)
            }
        })
    })
}
function retrieve_stripe_source(req){
    return new Promise((resolve, reject) => {
        stripe.sources.retrieve(req.query.src
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
function update_stripe_source(req, source, acct, cust){
    return new Promise((resolve, reject) => {
        stripe.sources.update(source.id, {
            metadata: {
                user_id: req.session.userId,
                plan_id: "plan_EKH9hJs6m4yQrl",
                account_id: acct.id,
                customer_id: cust.id,
                user_mail: req.session.userMail,
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
function create_stripe_subscription(customer){
    return new Promise((resolve, reject) => {
        stripe.subscriptions.create({
            customer: customer.id,
            items: [{
                plan: "plan_EKH9hJs6m4yQrl",
            }]
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