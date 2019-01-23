const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p")
const express = require('express')
const router = express.Router()
const User = require('../models/req_user')
const notifications = require('../models/notifications').actions
const random_code_gen = require('../models/code_gen').default

router.route('/annule_resa')
    .post((req, res) => {
        let ret = {}, usr_pro, usr_art, events
        ret.result = {}
        ret.success = []
        ret.global_msg = []
        if (req.headers["x-access-token"] == req.session.token){
            // console.log(req.body)
            get_user(req.body.id_pro, ret)
            .then((pro) => {
                usr_pro = pro
                return get_user(req.body.id_art, ret)
            })
            .then((art) => {
                usr_art = art
                return get_events(req, ret)
            })
            .then((ev)=> {
                events = ev
                if (req.body.action == "pro_annulation"){
                    if (req.body.type_transac == "MOD"){
                        let amount_refund = parseFloat(req.body.price_refund)
                        //Remboursement total de l'atiste
                        console.log("100%")
                        console.log(amount_refund)
                    }
                }else{
                    if (req.body.type_transac == "MOD"){
                        //Récupération du paiment
                        User.get_payment([req.body.id_payment], (result, resolve, reject) =>{
                            if (result.length > 0){
                                resolve(result[0])
                            }else{
                                ret.success.push(false)
                                ret.global_msg.push("Récupération des informations du paiement impossible !")
                                reject(ret)
                            }
                        })
                        //Remboursement de l'artiste
                        .then((res0) => {
                            return make_stripe_refund(ret, req.body.price_refund, res0.charge) 
                        })
                        //Mettre à jour table "payments"
                        .then((res1) => {
                            return update_payment("`payments`.`state_payment`='annule', `payments`.`refund`='"+res1.id+"' WHERE `payments`.`id_p`="+req.body.id_payment, ret)
                        })
                        //Supprimer résa par tempo => refuses
                        .then(() => {
                            return get_action(req, ret)
                            .then((res20) => {
                                do_actions_deny(req, res20)
                            })
                        })
                        // //Envoi de mails
                        .then(() => {
                            if (req.body.mode == 1){
                                let hash = req.body.id_payment + '-' + new Date(req.body.date_payment).to2DigitsString()
                                //console.log("HASH : "+hash)
                                return random_code_gen.obj.convertBase(hash, random_code_gen.base12, random_code_gen.base54)
                                .then((code) => {
                                    send_mails(usr_pro, usr_art, code, req.body.price_refund, events)
                                })
                            }else
                                return send_mails(usr_pro, usr_art, null, req.body.price_refund, events)
                        })
                        .then((res2) => {
                            ret.notif = res2
                            ret.success.push(true)
                            ret.global_msg.push("Annulation de réservation effective, tu recevras un mail de confirmation dans les prochaines minutes !")
                            res.send(ret)
                        })
                        .catch((err) => {
                            res.send(err)
                        })
                    }else{
                        //Mettre à jour table "payments"
                        update_payment("`payments`.`state_payment`='annule', `payments`.`refund`='not_paid' WHERE `payments`.`id_p`="+req.body.id_payment, ret)
                        //Supprimer résa par tempo => refuses
                        .then(() => {
                            return get_action(req, ret)
                            .then((res20) => {
                                do_actions_deny(req, res20)
                            })
                        })
                        //Envoi de mails
                        .then(() => {
                            return send_mails(usr_pro, usr_art, null, req.body.price_refund, events)
                        })
                        .then((res2) => {
                            // console.log(res2)
                            ret.notif = res2
                            ret.success.push(true)
                            ret.global_msg.push("Annulation de réservation effective, tu recevras un mail de confirmation dans les prochaines minutes !")
                            res.send(ret)
                        })
                        .catch((err) => {
                            res.send(err)
                        })
                    }
                }
            })
        }else{
            ret.success.push(false)
            ret.global_msg.push("Session compromise !")
            res.send(ret)
        }
    });

function make_stripe_refund(ret, amount_refund, charge_id){
    return new Promise((resolve, reject) => {
        stripe.refunds.create({
            charge: charge_id,
            amount: parseInt(amount_refund * 100),
        }, function(err, refund){
            if (err){
                ret.success.push(false)
                ret.global_msg.push("Remboursement échoué !", err.message)
                reject(ret)
            }else
                resolve(refund)
        });
    })
}
// function make_stripe_payment(amount_refund, charge_id){
//     return new Promise((resolve, reject) => {
//         const refund = stripe.refunds.create({
//         charge: charge_id,
//         amount: amount_refund,
//         );
//     })
// }
function update_payment(req, ret){
    return User.update_payment(req, (result, resolve, reject) =>{
        if (result.affectedRows > 0){
            resolve()
        }else{
            ret.success.push(false)
            ret.global_msg.push("Mise à jour du paiement echouée !")
            reject(ret)
        }
    });
}
function get_user(id, ret){
    return new Promise((resolve, reject) => {
        User.getUser("WHERE `id`="+id, (result) =>{
            if (result != null){
                resolve(result)
            }else{
                ret.success.push(false)
                ret.global_msg.push("Impossible de récupérer les information de l'utilisateur !")
                reject(ret)
            }
        })
    })
}
function send_mails(user_pro, user_art, code = null, amount = 0, events){
    // console.log(user_pro)
    // console.log(user_art)
    return notifications.mail_abord_resa(user_pro, user_art, code, "resa_annule_for_pro", amount, events)
	.then(() => notifications.mail_abord_resa(user_art, user_pro, code, "resa_annule_for_art", amount, events))
}
function get_action(req, ret){
	return new Promise((resolve, reject) => {
		User.get_accept_action_module(req.body.id_type_message, (result) =>{
			if (result.length > 0){
				ret.result.actions = result
				// ret.success.push(true)
				// ret.global_msg.push("Récupération de l'action réussite !")
				resolve(ret)
			}else{
				ret.success.push(false)
				ret.global_msg.push("Impossible de récupérer l'action liée à la demande (demande expirée) !")
				reject(ret);
			}
		})
	})
}
function do_actions_deny(req, ret){
	const len = ret.result.actions.length
	//console.log(ret.result.actions)
	return new Promise((resolve, reject) => {
		for (var k in ret.result.actions){
			let action = ret.result.actions[k].action_ko
			//console.log("action -> "+action)
			if (action != null){
				User.do_action_in_module(action, (result, err) => {
					//console.log(result)
					const resOfAction = result.affectedRows == 0 ? result.changedRows : result.affectedRows
					// console.log("error -> ")
					// console.log(err)
					// console.log("resOfAction -> ")
					// console.log(resOfAction)
					if (resOfAction > 0){
						//ret.result.action = result
						// ret.success.push(true)
						// ret.global_msg.push("Action effectuée !")
						//resolve(ret)
					}else{
						//console.log("Action echouée !")
						// ret.success.push(false)
						// ret.global_msg.push("Action echouée !")
						reject(ret)
					}
					if (err)
						reject(ret)
					if (k == len - 1){
						ret.result.actionForNotif = ret.result.actions[k]
						resolve(ret)
					}
				})
			}else{
				if (k == len - 1){
					ret.result.actionForNotif = ret.result.actions[k]
					resolve(ret)
				}
			}		
		}
	})
}
function get_events(req, ret){
	return new Promise((resolve, reject) => {
		User.getEventsInTypeMessage(req.body.id_type_message, (result)=> {
			if (result.length > 0){
				// ret.result.events = result
				// ret.success.push(true)
				// ret.global_msg.push("Evennements récupérés !")
				resolve(result)
			}else{
				ret.success.push(false)
				ret.global_msg.push("Erreur lors de la récupération des évennements !")
                reject(ret)			
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
// Date.getDaysBetween = function(date1, date2){
//     var one_day = 1000*60*60*24;
//     var difference = date1 - date2
//     return (difference/one_day)
// };
// Date.getMinutesBetween = function(date1, date2){
//     var one_minute = 1000*60;
//     var difference = date1 - date2
//     return (difference/one_minute)
// };
module.exports = router