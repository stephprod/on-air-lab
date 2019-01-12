const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()
//const User = require('../models/req_user')

router.route('/payment')
    .get((req, res) => {
        //console.log(req.query)
        res.locals.session = req.session
        create_stripe_customer(req, req.query.source)
        .then((res) => {
            res.send({customer : res})
        }).catch((err) => {
            res.send({err : err.message})
        })
    })
	.post((req, res) => {
        let ret = {}
        ret.success = []
        ret.global_msg = []
        let cust, plan, account
        create_stripe_account(req, req.body.accountToken)
        .then((res0) => {
            account = res0
            console.log("account : ")
            console.log(res0)
            return create_stripe_customer(req, req.body.sourceId)
        })
        // .then((res6) => {
        //     //let card
        //     cust = res6
        //     console.log("customer : ")
        //     console.log(res6)
        //     return create_stripe_plan(req)
        // })
        .then((res2) => {
            cust = res2
            console.log("customer : ")
            console.log(res2)
            return update_stripe_source(req.body.sourceId, account, res2, req)
        })
        .then(() => {
            return create_stripe_subscription(cust)
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
// function get_profil(req){
//     return new Promise((resolve, reject) => {
//         User.getInfoPro_etablissement_for_account(req.session.userId, (result) => {
//             if (result.length > 0){
//                 resolve(result[0])
//             }else{
//                 reject(new Error("Aucun profil existant !"))
//             }
//         })
//     })
// }
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
function update_stripe_account(account, req){
    return new Promise((resolve, reject) => {
        stripe.accounts.update(
            account.id,
            {
              legal_entity: {
                additional_owners: {
                  // Note the use of an object instead of an array
                  0: {
                      first_name: req.session.userFirstName, 
                      last_name: req.session.userName,
                    //   address: {

                    //   },
                    //   dob: {

                    //   },
                      email: req.session.userMail,
                      //verification: document/status
                    },
                }
              }
        }, function(err, account) {
            // asynchronously called
            if (err){
                reject(err)
            }else{
                resolve(account)
            }
        });
    })
}
function create_stripe_customer(req, token){
    return new Promise((resolve, reject) => {
        stripe.customers.create({
            description: `${req.session.userId} ${req.body.prenom} ${req.body.nom}`,
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
function create_stripe_plan(req){
    return new Promise((resolve, reject) => {
        stripe.plans.create({
            amount: parseFloat(req.body.price),
            interval: "month",
            product: "prod_EKH5fP8aV3rwTy",
            currency: "eur"
        }, function(err, plan) {
            // asynchronously called
            if (err){
                reject(err)
            }else{
                resolve(plan)
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
function update_stripe_source(sourceId, account, customer, req){
    return new Promise((resolve, reject) => {
        stripe.sources.update(sourceId, {
            metadata: {
                user_id: req.session.userId,
                plan_id: "plan_EKH9hJs6m4yQrl",
                account_id: account.id,
                customer_id: customer.id
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