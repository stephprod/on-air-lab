const express = require('express')
const User = require('../models/req_user')
// const _ = require('lodash')

const router = express.Router()
let business = {}
let table = []
let lundi = {}
let lundid = {}
let mardi = {}
let mardid = {}
let mercredi = {}
let mercredid = {}
let jeudi = {}
let jeudid = {}
let vendredi = {}
let vendredid = {}
let samedi = {}
let samedid = {}
let dimanche = {}
let dimanched = {}

router.route('/agenda')
	.get((request, response) => {
		response.locals.session = request.session
		if (request.session.userId == undefined) {
			response.render('pages/index')
		}else{
			User.get_dow(request.session.userId, (result) => {
				// LODASH CONDITION
				//console.log(_.get(result[0], 'mardi') == ''undefined'')
				if (result.length > 0){
					if (result[0].lundi != 'undefined' && result[0].lundi != 'null'){
						lundi = {dow : [1],start : result[0].lundi.substr(0,5),end : result[0].pause.substr(0,5)}
						lundid = {dow : [1],start : result[0].pause.substr(6,5),end : result[0].lundi.substr(6,5)}
					}
					if (result[0].mardi != 'undefined' && result[0].mardi != 'null'){
						mardi = {dow : [2],start : result[0].mardi.substr(0,5),end : result[0].pause.substr(0,5)}
						mardid = {dow : [2],start : result[0].pause.substr(6,5),end : result[0].mardi.substr(6,5)}
					}
					if (result[0].mercredi != 'undefined' && result[0].mercredi != 'null'){
						mercredi = {dow : [3],start : result[0].mercredi.substr(0,5),end : result[0].pause.substr(0,5)}
						mercredid = {dow : [3],start : result[0].pause.substr(6,5),end : result[0].mercredi.substr(6,5)}
					}
					if (result[0].jeudi != 'undefined' && result[0].jeudi != 'null'){
						jeudi = {dow : [4],start : result[0].jeudi.substr(0,5),end : result[0].pause.substr(0,5)}
						jeudid = {dow : [4],start : result[0].pause.substr(6,5),end : result[0].jeudi.substr(6,5)}
					}
					if (result[0].vendredi != 'undefined' && result[0].vendredi != 'null'){
						vendredi = {dow : [5],start : result[0].vendredi.substr(0,5),end : result[0].pause.substr(0,5)}
						vendredid = {dow : [5],start : result[0].pause.substr(6,5),end : result[0].vendredi.substr(6,5)}
					}
					if (result[0].samedi != 'undefined' && result[0].samedi != 'null'){
						samedi = {dow : [6],start : result[0].samedi.substr(0,5),end : result[0].pause.substr(0,5)}
						samedid = {dow : [6],start : result[0].pause.substr(6,5),end : result[0].samedi.substr(6,5)}
					}
					if (result[0].dimanche != 'undefined' && result[0].dimanche != 'null'){
						dimanche = {dow : [0],start : result[0].dimanche.substr(0,5),end : result[0].pause.substr(0,5)}
						dimanched = {dow : [0],start : result[0].pause.substr(6,5),end : result[0].dimanche.substr(6,5)}
					}
						business = {lundi,mardi,mercredi,jeudi,vendredi,samedi,dimanche,lundid,mardid,mercredid,jeudid,vendredid,samedid,dimanched}
						for(let k in business){table.push(business[k])}
							//console.log(table)
				}
				//EN LOCALS BUSINESS IS NOT DEFINED SHIIIIT
				User.get_calendar(request.session.userId, (result) => {
					if (result.length >= 0){
						let data = JSON.stringify(result)
						data = data.replace(/"([^(")"]+)":/g,"$1:");
						let d = JSON.stringify(table)
						table = [];
						response.render('pages/agenda', {eventObj : data, dow: d})
					}
				})
			})
		}
	})
	.post((request, response) => {
		//console.log(request.body)
		let ret = {}
		ret.success = []
		ret.global_msg = []
		if (request.session.token == request.headers["x-access-token"]){
			let table = [];
			for (let prop in request.body){
				table.push(request.body[prop])
			}
			table.push(request.session.userId)
			User.insertCalendar(table, (result) => {
				if (result == 0) {
					console.log("ca marche pas")
				}else{
					console.log("Envoi data au calme")
					table.push(result)
					response.send(table)
				}

			})
		}else{
			ret.success.push(false)
			ret.global_msg.push("Session compromise !")
			response.send(ret)
		}
	})

module.exports = router
