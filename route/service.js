const express = require('express')
const User = require('../models/req_user')

const router = express.Router()

router.route('/service')
	.get((request, response) => {

	})
	.post((request, response) => {
		let table = []
		let serv = []
		table.push(request.session.userId)
		for (let prop in request.body){
			table.push(request.body[prop])
		}
		console.log(table)
		User.deleteServForPro(table[0], (res) =>{
			if (res > 0){
				//SI LA SUPPRESSION DES SERVICES EXISTANTS A FONCTIONNEE, INSERTION DES NOUVEAUX SERVICE
				for (k in table[1]){
					let tableServ = [table[0], table[1][k]]
					setTimeout((function(k) {
						return function(){
							User.addServForPro(tableServ, result =>{
								if (result > 0)
								{
									console.log("success insert service table appartenir")
								}
								else{
									console.log("error insert service table appartenir")
									response.end()
								}
								if (k == table[1].length-1){
									response.end()
								}
							})
						}
					}) (k), 100);
				}
			}
			else
			{
				//SINON VERIFICATION DE L'ABSENCE DE SERVICE POUR LE PRO, PUIS INSERTION
				User.displayServiceForPro(table[0], (res) =>{
					if (res.length > 0){
						console.log("error delete service table table appartenir")
						response.end()
					}
					else
					{
						for (k in table[1]){
							let tableServ = [table[0], table[1][k]]
							setTimeout((function(k) {
								return function(){
									User.addServForPro(tableServ, result =>{
										if (result > 0)
										{
											console.log("success insert service table appartenir")
										}
										else{
											console.log("error insert service table appartenir")
											response.end()
										}
										if (k == table[1].length-1){
											response.end()
										}
									})
								};
							}) (k), 100);
						}
					}
				})
			}
		})
})
module.exports = router
