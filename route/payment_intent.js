const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p")
const express = require('express')
const router = express.Router()
const User = require('../models/req_user')

router.param('id', (req, res, next, token) => {
    req.session.id_u = token
    //const intent
	//console.log(req.session.id_u_temp)
    User.getUser("WHERE id='"+token+"'", (res) => {
        if (res !== undefined && res){
            let obj = {}
            obj.id_coresp = res.id
            obj.nom = res.nom
            obj.prenom = res.prenom
            obj.type = res.type
            req.session.user_receiv = obj
        }
        next()
    })
})

router.route('/payment-intent/:id')
    .post((req, res) => {
        let ret = {}
        ret.result = {}
        ret.success = []
        ret.global_msg = []
        User.get_pro_account(req.session.user_receiv.id_coresp, (result, resolve, reject) => {
            if (result.length > 0){
                //console.log(result[0])
                resolve(result[0].account)
            }
            else
                reject(new Error("Compte irrécupérable !"))
        }).then((res) => {
            return stripe.paymentIntents.create({
                amount: parseFloat(req.body.price) * 100,
                currency: 'eur',
                allowed_source_types: ['card'],
                description: req.body.desc,
                statement_descriptor: "user "+req.session.user_receiv.id_coresp,
                transfer_group: "pay_for_"+req.session.user_receiv.id_coresp,
                on_behalf_of: res,
                metadata : {
                    id_request: req.body.id_r
                }
            })
        }).then((result) => {
            //if (result.error)
            ret.result = result.client_secret
            ret.price = parseFloat(req.body.price)
            ret.desc = req.body.desc
            ret.id = req.session.user_receiv.id_coresp
            ret.email = req.session.userMail
            ret.nom = req.session.userName
            ret.prenom = req.session.userFirstName
            ret.success.push(true)
            ret.global_msg.push("Réservation effectuée, patientez pour le paiement !")
            //console.log(req.query)
            res.send(ret)
        }).catch((err) => {
            ret.success.push(false)
            ret.global_msg.push("Une erreur est survenue lors de la création de la passerelle sécurisée pour le paiement !", err.message)
            res.send(ret)
        });
    });
module.exports = router