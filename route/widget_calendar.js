const express = require('express')
const User = require('../models/req_user')

const router = express.Router()
let id_user
router.route('/widget_calendar')
	.get((request, response) => {
		//console.log(request.session)
		response.locals.session = request.session
		response.render('pages/widget_calendar', {page: request.query.page})
	})
	.post((request, response) => {
		let table = []
		if (request.session.token == request.headers["x-access-token"]){
			if (request.body.page !== undefined){
				if (request.body.page == "profil")
					id_user = request.session.id_u
				else{
					if (request.session.userType == 4)
						id_user = request.session.id_coresp
					else
						id_user = request.session.userId
				}
			}
			else
				id_user = request.session.userId
			//console.log(request.session)
			//console.log(request.body)
			//console.log(id_user)
			User.get_calendar_widget("id_pro= '"+id_user+"' AND LEFT(start, 10)='"+request.body.d+"'", (result) =>{
				for(var k in result){
					table.push(result[k].start.substr(11,5),result[k].end.substr(11,5));
				}
				User.get_dow_widget("SELECT `"+request.body.word+"` AS day,`pause` FROM dow WHERE userid= '"+id_user+"'", (result) =>{
					table[table.length] = []
					for(var r in result)
						table[table.length - 1].push(result[r].day, result[r].pause);
					//console.log(table)
					response.send(table)
				})
			})
		}else{
			response.send("Token compromised !")
		}

	})

module.exports = router
