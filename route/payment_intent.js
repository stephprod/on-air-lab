const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()
const User = require('../models/req_user')

router.param('id', (req, res, next, token) => {
    req.session.id_u = token
    //const intent
	//console.log(req.session.id_u_temp)
	//if (req.session.id_u == req.session.id_u_temp){
    User.getUser("id='"+token+"'", (res) => {
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
	// }
	// else
	// {
	// 	res.status(404).send("Not found")
	// }
})

router.route('/payment-intent/:id')
    .post((req, res) => {
        let ret = {}
        ret.result = {}
        stripe.paymentIntents.create({
            amount: parseFloat(req.body.price) * 100,
            currency: 'eur',
            allowed_source_types: ['card'],
        }).then((result) => {
            ret.result = result.client_secret
            //console.log(req.query)
            res.send(ret)
        });
    });
module.exports = router