const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()

router.route('/plan3dsecure')
    .get((req, res) => {
        let cust, account
        //console.log(req.query)
        create_stripe_account(req, req.query.accountToken)
        .then((res0) => {
            account = res0
            console.log("account : ")
            console.log(res0)
            return retrieve_stripe_customer(req)
        })
        .then((res1) =>{
            cust = res1
            console.log("customer : ")
            console.log(res1)
            return retrieve_stripe_source(cust)
        }).then((res2) => {
            console.log("source : ")
            console.log(res2)
            return update_stripe_source(req, res2, account, cust)
        })
        .then(() => {
            return create_stripe_subscription(cust)
        })
        .then(() => {
            res.redirect("/info-pro")
        })
        .catch((err) => {
            res.redirect("/info-pro")
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
function retrieve_stripe_source(customer){
    return new Promise((resolve, reject) => {
        stripe.sources.retrieve(customer.sources.data[0].id
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
                customer_id: cust.id
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
                resolve(subscription)
            }
        })
    })
}
module.exports = router