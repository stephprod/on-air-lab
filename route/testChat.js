const express = require('express')
const User = require('../models/req_user')
//let validator = require('../middlewares/valid_form').search

const router = express.Router()

router.route('/search')
	.get((request, response) => {
		response.render('pages/search', {name : "search"})
        console.log("ID du GARS "+request.session.userId)
        console.log("NOM du GARS "+request.session.userName)
	})
	.post((request, response) => {

	})
module.exports = router
