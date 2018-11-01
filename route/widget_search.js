const express = require('express')
const User = require('../models/req_user')
const session = require('express-session');
const router = express.Router()

router.route('/widget-search')
	.get((request, response) => {
			response.render('pages/widget_search', {user : request.session})
	})
	.post((request, response) => {
})
module.exports = router
