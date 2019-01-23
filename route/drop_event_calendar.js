const express = require('express')
const User = require('../models/req_user')
const notifications = require('../models/notifications').actions
const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p")
const router = express.Router()

router.route('/drop_event_calendar')
	.post((request, response) => {
		let ret = {}, user_pro, user_art, events
		ret.result = {}
		ret.success = []
		ret.global_msg = []
		if (request.session.token == request.headers["x-access-token"]){
			//console.log("Delete id "+request.body.id)
			if (request.body.id_art != ""){
				get_user(request.body.id_pro, ret)
				.then((pro) => {
					user_pro = pro
					return get_user(request.body.id_art, ret)
				})
				.then((art) => {
					user_art = art
					return get_events(request, ret)
				})
				.then((res0) => {
					events = res0
					if (request.body.type_transaction != "" && 
							request.body.type_transaction == "MOD"){
						//Récupération du paiment
						User.get_payment_by_request([request.body.id_payment_request], (result, resolve, reject) =>{
							if (result.length > 0){
								resolve(result[0])
							}else{
								ret.success.push(false)
								ret.global_msg.push("Récupération des informations du paiement impossible !")
								reject(ret)
							}
						})
						//Remboursement de l'artiste
						.then((res1) => {
							return make_stripe_refund(ret, request.body.price_refund, res1.charge) 
						})
						//Mettre à jour table "payments"
						.then((res2) => {
							return update_payment("`payments`.`state_payment`='annule', `payments`.`refund`='"+res2.id+"' WHERE `payments`.`id_p_request`="+request.body.id_payment_request, ret)
						})
						//Supprimer résa par tempo => refuses
						.then(() => {
							return get_action(request, ret)
							.then((res20) => {
								do_actions_deny(request, res20)
							})
						})
						// //Envoi de mails
						.then(() => {
								return send_mails(user_pro, user_art, null, request.body.price_refund, events)
						})
						.then((res3) => {
							ret.notif = res3
							ret.success.push(true)
							ret.global_msg.push("Annulation de réservation effective, tu recevras un mail de confirmation dans les prochaines minutes !")
							response.send(ret)
						})
						.catch((err) => {
							response.send(err)
						})
					}else if(request.body.type_transaction != "" && 
						request.body.type_transaction == "ESP"){
						//Mettre à jour table "payments"
						update_payment("`payments`.`state_payment`='annule', `payments`.`refund`='not_paid' WHERE `payments`.`id_p_request`="+request.body.id_payment_request, ret)
						//Supprimer résa par tempo => refuses
						.then(() => {
							return get_action(request, ret)
							.then((res0) => {
								do_actions_deny(request, res0)
							})
						})
						//Envoi de mails
						.then(() => {
							return send_mails(user_pro, user_art, null, request.body.price_refund, events)
						})
						.then((res1) => {
							// console.log(res2)
							ret.notif = res1
							ret.success.push(true)
							ret.global_msg.push("Annulation de réservation effective, tu recevras un mail de confirmation dans les prochaines minutes !")
							response.send(ret)
						})
						.catch((err) => {
							response.send(err)
						})
					}
				})
			}else{	
				User.drop_calendar(request.body.id_event)
				ret.success.push(true)
				ret.global_msg.push("Evènement supprimé avec succès !")
				response.send(ret)
			}
		}else{
			ret.success.push(false)
			ret.global_msg.push("Token compromised !")
			response.send(ret)
		}
})
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
function send_mails(user_pro, user_art, code = null, amount = 0, events){
    // console.log(user_pro)
    // console.log(user_art)
    return notifications.mail_abord_resa(user_pro, user_art, code, "calen_annule_for_pro", amount, events)
	.then(() => notifications.mail_abord_resa(user_art, user_pro, code, "calen_annule_for_art", amount, events))
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
module.exports = router
