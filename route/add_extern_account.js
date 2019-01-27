const stripe = require('stripe')("sk_test_o35xg7SsHTft63zVgw2Qm05p");
const express = require('express')
const router = express.Router()
const User = require('../models/req_user')

router.route('/add-external-account')
	.post((req, res) => {
        let ret = {}
        ret.success = []
        ret.global_msg = []
        // let cust, account
        User.get_profil(req.body.profil, (result, resolve, reject) =>{
            if (result.length > 0){
                resolve(result[0])
            }else{
                ret.success.push(false)
                ret.global_msg.push("Une erreur est survenue lors de la récupération des informations de votre profil !")
                reject(ret)
            }
        })
        .then((res0) => {
            return create_stripe_external_account(ret, res0.account, req.body.source)
        })
        .then((res1) => {
            User.update_profil("SET `profil`.`external_account`='"+res1.id+"' WHERE `profil`.`id_profil`="+req.body.profil, (result, resolve, reject) => {
                if (result.changedRows > 0){
                    resolve()
                }else{
                    ret.success.push(false)
                    ret.global_msg.push("Une erreur est survenue lors de la mise à jour de votre profil !")
                    reject(ret)
                }
            })
        })
        .then(() => {
            ret.success.push(true)
            ret.global_msg.push("Compte bancaire associé avec succès !")
            res.send(ret)
        })
        .catch((err) => {
            res.send(err);  
        })
});
function create_stripe_external_account(ret, accntId, token){
    return new Promise((resolve, reject) => {
        stripe.accounts.createExternalAccount(
            accntId,
            { external_account: token },
            function(err, bank_account) {
                // asynchronously called
                if (err){
                    ret.success.push(false)
                    ret.global_msg.push(err.message)
                    reject(ret)
                }else{
                    resolve(bank_account)
                }
        });
    });
}
module.exports = router