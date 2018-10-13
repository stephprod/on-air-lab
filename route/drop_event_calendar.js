*-*let express = require('express')
let User = require('../models/req_user')

let router = express.Router()

router.route('/drop_event_calendar')
	.get((request, response) => {
	})
	.post((request, response) => {
		console.log("Delete id "+request.body.id)
		User.drop_calendar(request.body.id)
	})

module.exports = router