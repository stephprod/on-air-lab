const express = require('express')
const User = require('../models/req_user')
const random_code_gen = require('../models/code_gen').default
const router = express.Router()
const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p")

router.route('/get-payment')
	.post((request, response) => {
        //response.locals.session = request.session
        let ret = {}
        let table = []
        let fee = 0.0
        let rslt
        ret.success = []
        ret.global_msg = []
        //ret.result = ""
        if (request.session.token == request.headers['x-access-token']){
            random_code_gen.obj.convertBase(request.body.code, random_code_gen.base54, random_code_gen.base12)
            .then((code) => {
                //console.log(code)
                table = code.split("-")
                //send_notification(user, wh_datas.data.object.amount, "accept", code)
                if (table.length != 2){
                    ret.success.push(false)
                    ret.result = code
                    ret.global_msg.push("Le code inséré est incorrect !")
                    response.send(ret)
                }else{
                    User.get_payment(table[0], (result, resolve, reject) =>{
                        if (result.length > 0){
                            //console.log(result)
                            let date_pay = new Date(result[0].date_payment)
                            // console.log(date_pay.to2DigitsString())
                            // console.log(table[1])
                            if (date_pay.to2DigitsString() == table[1])
                                resolve(result[0])
                            else
                                reject(new Error("Code inséré expiré ou inconnu !"))
                        }else{
                            reject(new Error("Code inséré expiré ou inconnu !"))
                        }
                    }).then((res) => {
                        rslt = res
                        return User.get_pro_payment_source(res.id_pro, (result, resolve, reject) => {
                            if (result.length > 0){
                                //console.log(result[0])
                                resolve(result)
                            }
                            else
                                reject(new Error("Source irrécupérable !"))
                        })
                    }).then((res2) => {
                        fee = rslt.price_payment * 3.5
                        let amount_net = (rslt.price_payment * 100) - fee
                        stripe.payouts.create({
                            amount: amount_net,
                            currency: "eur",
                            card: res2.source
                        }, function(err, payout) {
                            // asynchronously called
                            if (err){
                                ret.success.push(false)
                                ret.global_msg.push(err.message)
                            }else{
                                ret.success.push(true)
                                ret.global_msg.push("Un paiement de "+(amount_net / 100)+"€ a été effectué à destination de votre compte, il sera effectif dans 1-2 jours ouvrés !")
                            }
                            ret.result = code
                            response.send(ret)
                        });
                    }, (err) => {
                        ret.success.push(false)
                        ret.global_msg.push(err.name+": "+err.message)
                        ret.result = code
                        response.send(ret)
                    })
                    .catch((err) => {
                        ret.success.push(false)
                        ret.global_msg.push(err.name+": "+err.message)
                        ret.result = code
                        response.send(ret)
                    })
                }
            })
        }else{
            ret.success.push(false)
            ret.global_msg.push("Session compromise !")
            response.send(ret)
        }
})
Date.prototype.to2DigitsString = function() {
    return this.getUTCHours().toString(10).padStart(2, '0') +
        this.getUTCDate().toString(10).padStart(2, '0') +
        (this.getUTCMonth() + 1).toString(10).padStart(2, '0') +
        this.getUTCFullYear().toString(10).substring(2);
};
module.exports = router