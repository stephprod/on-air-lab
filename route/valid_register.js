const express = require('express')
const User = require('../models/req_user')

const router = express.Router()

router.param('token', (req, res, next, token) => {
	//console.log(token)
	req.session.token = token
	User.getUser("WHERE jeton='"+token+"'", (resu) => {
		if (resu !== undefined && resu){
			req.user = resu
			next()
		}else{
            let obj = {}
            obj.success = []
            obj.global_msg = []
            obj.success.push(false)
			res.locals.session = req.session
			obj.global_msg.push("Oups ! Liens corrompu ou expiré.")
			res.render("pages/index", {registerObj: obj})
		}
	})
})

router.route('/validRegister/:token')
	.get((request, response) => {
        let obj = {}
        obj.success = []
        obj.global_msg = []
		response.locals.session = request.session
        response.locals.session.user = request.user
        User.updateUser("verifie='1' WHERE jeton='"+request.session.token+"'"
		, (result) => {
            if (result > 0){
				obj.global_msg = ["Utilisateur vérifié avec succès, veuillez cliquer sur le lien <a href='/'>Accueil</a> !"]
				obj.success.push(true)
			}else{
				obj.global_msg = ["Une erreur technique est survenue lors de l'activation du compte, contactez le support !"]
				obj.success.push(false)
            }
            response.render('pages/index', {registerObj: obj})
        })
		//console.log(response.locals)
})
module.exports = router
