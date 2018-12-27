const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()
const User = require('../models/req_user')
const notifications = require('../models/notifications').actions

router.route('/delete-plan')
	.post((req, res) => {
        let table = [], planId, ret = {}
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
            get_current_plan(table)
            .then((res) => {
                planId = res.plan
                return get_subscriptions(planId)
            })
            .then((res2) => {
                //console.log(res2)
                for (var k in res2.data){
                    //console.log(res2.data[k])
                    if (k == res2.data.length - 1){
                        return delete_subscriptions(res2.data[k].id)
                    }else{
                        delete_subscriptions(res2.data[k].id)
                        .catch((err) => err)
                    }    
                }
            })
            .then(() => {
                delete_plan(planId)   
            }).then(() => {
                User.update_pro_payment_source_after_delete(table[0], (result, resolve) => {
                    if (result.changedRows > 0){
                        resolve()
                    }else{
                        throw new Error("Erreur lors de la mise à jour des données, veuillez contacter l'administrateur !")
                    }
                })
            })
            .then(() => {
                return notifications.mail_with_links(user, "plan_deleted", "http://localhost:4000/info-pro")
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

function get_current_plan(table){
    return new Promise((resolve) =>{
        User.get_pro_payment_source(table[0], (result, resolve) => {
            if (result.length > 0){
                resolve(result[0])
            }else{
                throw new Error("Récupération de la source du paiement de l'abonnement impossible !")
            }
        }).then((res) => {
            resolve(res)
        }).catch((err) => err)
    })
}
function delete_plan(id_plan){
    return new Promise((resolve) =>{
        stripe.plans.del(
            id_plan,
            function(err, confirmation) {
                // asynchronously called
                if (err)
                    throw new Error("Erreur lors de la suppression du plan !")
                else{
                    resolve(confirmation)
                }
            }
        );
    })
}
function get_subscriptions(id_plan){
    return new Promise((resolve) =>{
        stripe.subscriptions.list({
            plan: id_plan,
        }, (err, subscriptions) => {
            if (err)
                throw(err)
            else
                resolve(subscriptions)
        });
    })
}
function delete_subscriptions(id){
    return new Promise((resolve) =>{
        stripe.subscriptions.del(
            id,
            function(err, confirmation) {
                // asynchronously called
                if (err)
                    throw new Error("Erreur lors de la suppression de la souscription ("+id+") !")
                else{
                    resolve(confirmation)
                }
            }
        );
    })
}
module.exports = router