const express = require('express')
const User = require('../models/req_user')

const router = express.Router()

router.route('/drop_event_calendar')
	.get((request, response) => {
	})
	.post((request, response) => {
		console.log("Delete id "+request.body.id)
		User.drop_calendar(request.body.id)
		response.end()
	})

module.exports = router
