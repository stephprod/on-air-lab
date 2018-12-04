const express = require('express')
const User = require('../models/req_user')

const router = express.Router()

router.route('/historique_payment')
	.get((request, response) => {
        let obj = [
        {
            desc : 'desc bdd',
            date : 'date create',
            etat : 'valide',
            type : 'abonnement',
            class : 'valide',
            color : 'pagado'
        },
        {
            desc : 'desc bdd',
            date : 'date create',
            etat : 'annulé',
            type : 'payment',
            class : 'annule',
            color : 'cancelado'
        },
        {
            desc : 'desc bdd',
            date : 'date create',
            etat : 'en attente',
            type : 'payment',
            class : 'attente',
            color : 'pendiente'
        }];
		response.render('pages/historique_abo', {objPayment : obj})
	})
	.post((request, response) => {
	})
module.exports = router