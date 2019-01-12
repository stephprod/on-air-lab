const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()

router.route('/plan3dsecure')
    .get((req, res) => {
        let source, plan, cust
        //console.log(req.query)
        create_stripe_plan(req)
        .then((res) => {
            plan = res
            return retrieve_stripe_customer(req)
        })
        .then((res2) => {
            cust = res2
            return retrieve_stripe_source(res2)
        })
        .then((res3) => {
            source = res3
            return update_stripe_source(req, plan)
        })
        .then((res4) => {
            source = res4
            return create_stripe_subscription(plan, cust)
        })
        .then((res5) => {
            let datas = {}
            return create_stripe_account(datas)
        })
        .then((res6) => {
            res.redirect("/info-pro")
        })
        .catch((err) => {
            res.redirect("/info-pro")
        })
        // stripe.plans.create({
        //     amount: parseFloat(req.query.amount),
        //     interval: "month",
        //     product: "prod_E3Lh8uPFzCj9gs",
        //     currency: "eur"
        // }, function(err, plan) {
        //     // console.log(err)
        //     // console.log("plan : ")
        //     // console.log(plan);
        //     stripe.customers.retrieve(req.query.cust,
        //     function(err, customer) {
        //         // asynchronously called
        //         stripe.sources.retrieve(customer.sources.data[0].id
        //         , function(err, source) {
        //             //console.log(source.id)
        //             stripe.sources.update(source.id, {
        //                 metadata: {plan_id: plan.id}
        //             }, function(){
        //                 stripe.subscriptions.create({
        //                     customer: req.query.cust,
        //                     items: [
        //                         {
        //                             plan: plan.id,
        //                         },
        //                     ]
        //                 }, function() {
        //                     // console.log("subscription : ")
        //                     // console.log(subscription)
        //                     // console.log(err)
        //                     // asynchronously called
        //                     res.redirect("/info-pro")
        //                 });
        //             })
        //         });
        //     });
        // })
})
function create_stripe_account(infos){
    return new Promise((resolve, reject) => {
        stripe.accounts.create({
            type: 'custom',
            country: 'FR',
            email: infos.email,
            legal_entity: {
                address : infos.adresse,
                first_name: infos.firstName,
                personal_id_number: infos.SIRET,
            }
        }, function(err, account) {
            // asynchronously called
            if (err){
                reject(new Error(err.message))
            }else{
                resolve(account)
            }
        });
    });
}
function create_stripe_plan(req){
    return new Promise((resolve, reject) => {
        stripe.plans.create({
            amount: parseFloat(req.query.amount),
            interval: "month",
            product: "prod_E3Lh8uPFzCj9gs",
            currency: "eur"
        }, function(err, plan) {
            // asynchronously called
            if (err){
                reject(new Error(err.message))
            }else{
                resolve(plan)
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
                reject(new Error(err.message))
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
function update_stripe_source(source, plan){
    return new Promise((resolve, reject) => {
        stripe.sources.update(source.id, {
            metadata: {plan_id: plan.id}
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
function create_stripe_subscription(plan, customer){
    return new Promise((resolve, reject) => {
        stripe.subscriptions.create({
            customer: customer.id,
            items: [{
                plan: plan.id,
            }]
        }, function(err, subscription) {
            // asynchronously called
            if (err){
                reject(new Error(err.message))
            }else{
                resolve(subscription)
            }
        })
    })
}
module.exports = router