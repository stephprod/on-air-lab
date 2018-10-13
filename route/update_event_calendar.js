*-*let express = require('express')
let User = require('../models/req_user')

let router = express.Router()

router.route('/update_event_calendar')
	.get((request, response) => {
	})
	.post((request, response) => {
		let start = request.body.start;
		let end = request.body.end;
		let id = request.body.id;
		User.update_calendar(start, end, id, (result) => {
			if (result == 0) {
				console.log("Aucune maj effectue")
			}else{
				console.log("Update data au calme")
			}
		})
	})

module.exports = router