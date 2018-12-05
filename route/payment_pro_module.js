const express = require('express')
const User = require('../models/req_user')
const validator = require('../middlewares/valid_form').register_updatePassword
//const uid = require('rand-token').uid
const router = express.Router()

router.route('/payment-request')
	.post(validator, (request, response) => {
        let ret = {}
		ret.success = []
        ret.global_msg = []
        ret.result = {}
        ret.msg = "Demande de paiement !"
        insert_payment(request, ret)
            .then((res) => {
                return insert_type_msg(request, res)
            }, (err) => {
                console.log(err)
            }).then((res) => {
                return insert_msg(request, res)
            }).then((res) => {
                return tempo(request, res)
            }).then((res) => {
                response.send(res)
            }).catch ((err) =>{
                response.send(err)
            })
})
function insert_payment(req, ret){
    var tableP = []
    return new Promise((resolve) => {
        if (req.session.token == req.headers["x-access-token"]){
            //Requête d'insertion d'un paiement
            tableP.push(req.body.receiver, req.body.sender, req.body.desc, req.body.price)
            User.insert_payment_db(tableP, (res) => {
                if (res > 0){
                    ret.result.id_p = res
                    ret.success.push(true)
                    ret.global_msg.push("Paiement enregistré !")
                    //console.log(ret)
                    resolve(ret)
                }else{
                    ret.success.push(false)
                    ret.global_msg.push("Erreur lors de l'insertion du paiement !")
                    throw ret;
                }
            });
        }else{
            ret.success.push(false)
            ret.global_msg.push("Token compromised !")
            throw ret;
        }
    });
}
function insert_type_msg(req, ret){
    var tableTM = []
    return new Promise((resolve) => {
        //console.log(ret)
        tableTM.push("payment", ret.result.id_p)
        User.insertTypePM(tableTM)
        .then((res) => {
            if (res > 0){
                ret.success.push(true)
                ret.result.id_type_m = res
                ret.global_msg.push("Type du message inséré !")   
                resolve(ret)
            }else{
                ret.success.push(false)
                ret.global_msg.push("Erreur lors de l'insertion du type du message !")
                throw ret
            }
        }).catch((err) => {
            throw err;
        });
    });
}
function insert_msg(req, ret){
    var tableM = []
    var created_date = new Date()
    ret.created = created_date
    return new Promise((resolve) => {
        //console.log(ret)
        tableM.push(req.body.sender, req.body.receiver, "Demande de paiement !", req.body.room, ret.result.id_type_m, created_date)
        User.insertMessages(tableM, (res) => {
            if (res > 0){
                ret.success.push(true)
                ret.result.id_m = res
                ret.global_msg.push("Message inséré !")   
                resolve(ret)
            }else{
                ret.success.push(false)
                ret.global_msg.push("Erreur lors de l'insertion du message !")
                throw ret
            }
        });
    });
}
function tempo(req, ret){
    var tableTemp = []
    return new Promise((resolve) => {
        //TEMPOSRISATION
		var req_ok = 'UPDATE `payment_request` SET `payment_request`.`acceptation`=1 WHERE `payment_request`.`id`='+ret.result.id_p,
		req_ko = 'DELETE FROM `payment_request` WHERE `payment_request`.`id`='+ret.result.id_p
		tableTemp.push(req_ok, req_ko, req.body.receiver, req.body.sender, ret.result.id_type_m)
		User.insertTemp(tableTemp, (result)=>{
			if (result > 0){
                ret.success.push(true)
                ret.global_msg.push("Temporisation créée !")
				ret.result.id_t = result
                resolve(ret)
            }
            else{
                ret.success.push(false)
                ret.global_msg.push("Erreur dans la temporisation de la demande !")
                throw ret;
            }
		});
    });
}
module.exports = router
