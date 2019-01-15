const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()
const User = require('../models/req_user')
const notifications = require('../models/notifications').actions

router.route('/delete-plan')
	.post((req, res) => {
        let table = [], profil, ret = {}
        ret.success = []
        ret.global_msg = []
        if (req.session.token == req.headers["x-access-token"]){
            var user = {id: req.session.userId,
                nom: req.session.userName,
                prenom: req.session.userFirstName,
                type: req.session.userType,
                email: req.session.userMail    
            }
            for (let prop in req.body){
                table.push(req.body[prop])
            }
            get_current_stripe_plan(table)
            .then((res) => {
                profil = res
                return get_stripe_subscriptions(res.plan)
            })
            .then((res2) => {
                //console.log(res2)
                for (var k in res2.data){
                    // console.log(res2.data[k].customer)
                    // console.log(profil.customer)
                    if (profil.customer == res2.data[k].customer){
                        return delete_stripe_subscriptions(res2.data[k].id)
                    }   
                }
                return new Promise((resolve, reject) => {
                    reject(new Error("Abonnement introuvable !"))
                })
            })
            .then(() => {
                User.update_profil("SET `customer`='NULL', account='NULL' WHERE `id_profil`="+profil.id_profil, (result, resolve, reject) => {
                    if (result.changedRows > 0){
                        resolve()
                    }else{
                        reject(new Error("Mise à jour du profil échouée !"))
                    }
                })   
            })
            .then(() => {
                User.update_pro_payment_source_after_delete(table[0], (result, resolve, reject) => {
                    if (result.changedRows > 0){
                        resolve()
                    }else{
                        reject(new Error("Erreur lors de la mise à jour des données, veuillez contacter l'administrateur !"))
                    }
                })
            })
            .then(() => {
                return delete_stripe_account(profil.account)
            })
            .then(() => {
                return delete_stripe_customer(profil.customer)
            })
            .then(() => {
                return notifications.mail_with_links(user, "subscription_deleted", "http://localhost:4000/info-pro")
            })
            .then(() => {
                req.session.abonnement = false
                ret.success.push(true)
                ret.global_msg.push("Abonnement supprimé avec succès, vous ne serez plus débité automatiquement !")
                res.send(ret)
            }).catch((err) => {
                ret.success.push(false)
                ret.global_msg.push("Une erreur est survenue lors de la suppression de votre abonnement !", err.type+': '+err.message)
                res.send(ret)
            })
        }else{
            ret.success.push(false)
            ret.global_msg.push("Session compromise !")
            res.send(ret)
        }
});

function get_current_stripe_plan(table){
    return new Promise((resolve, reject) =>{
        User.get_pro_payment_plan(table[0], (result, resolve) => {
            if (result.length > 0){
                resolve(result[0])
            }else{
                reject(new Error("Récupération de la source du paiement de l'abonnement impossible !"))
            }
        }).then((res) => {
            resolve(res)
        }).catch((err) => err)
    })
}
function delete_stripe_customer(id_cust){
    return new Promise((resolve, reject) =>{
        stripe.customers.del(
            id_cust,
            function(err, confirmation) {
                // asynchronously called
                if (err)
                    reject(new Error("Erreur lors de la suppression du customer !"))
                else{
                    resolve(confirmation)
                }
            }
        );
    })
}
function delete_stripe_account(id_account){
    return new Promise((resolve, reject) =>{
        stripe.accounts.del(
            id_account,
            function(err, confirmation) {
                // asynchronously called
                if (err)
                    reject(new Error("Erreur lors de la suppression du compte !"))
                else{
                    resolve(confirmation)
                }
            }
        );
    })
}
function get_stripe_subscriptions(id_plan){
    return new Promise((resolve, reject) =>{
        stripe.subscriptions.list({
            plan: id_plan,
        }, (err, subscriptions) => {
            if (err)
                reject(err)
            else
                resolve(subscriptions)
        });
    })
}
function delete_stripe_subscriptions(id){
    return new Promise((resolve, reject) =>{
        stripe.subscriptions.del(
            id,
            function(err, confirmation) {
                // asynchronously called
                if (err)
                    reject(new Error("Erreur lors de la suppression de la souscription ("+id+") !"))
                else{
                    resolve(confirmation)
                }
            }
        );
    })
}
module.exports = router