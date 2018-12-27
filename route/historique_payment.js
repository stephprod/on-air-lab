const express = require('express')
const User = require('../models/req_user')

const router = express.Router()

router.route('/historique_payment')
	.get((request, response) => {
        response.locals.session = request.session
        let obj = [];
        User.historique_payment(request.session.userId, (result, resolve, reject) => {
            if(result.length > 0){
                for(var k in result){
                    let curr = result[k]
                    curr.class = result[k].state_payment
                    if(result[k].state_payment == 'annule')
                        curr.color = 'cancelado'
                    else if(result[k].state_payment == 'valide')
                        curr.color = 'pagado'
                    else
                        curr.color = 'pendiente'
                    obj.push(curr);
                    if(k == (result.length - 1))
                        resolve(obj)
                }

            }else{
                reject('Aucun payment')
            }
        }).then((result) => {
            response.render('pages/historique_abo', {objPayment : result})
        }, () => {
            response.render('pages/historique_abo', {objPayment : null})
        })
	})
module.exports = router