const express = require('express')
const User = require('../models/req_user')
const notifications = require('../models/notifications').x
const router = express.Router()
//PROMISE http client
const axios = require('axios');
// const nodemailer = require('nodemailer')
// const transporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//         user: 'ijv6lvrhtrfvwaqq@ethereal.email', // generated ethereal user
//         pass: 'y3HEPhr67AdcBswmcg' // generated ethereal password
//     }
// });
//const nodemailer = require('nodemailer')
// const transporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//         user: 'ijv6lvrhtrfvwaqq@ethereal.email', // generated ethereal user
//         pass: 'y3HEPhr67AdcBswmcg' // generated ethereal password
//     }
// });
//const mail_gen = require("./mail_generator")
//console.log(notifications("a", "b", "c", "d", "e", "f"))
//notifications("a", "b", "c", "d", "e", "f")
//	.then ((res) => {console.log(res)})
router.route('/mail')
	.post((req, res) => {
		//console.log(req.body)
		let table = []
		let ret = {}
		ret.success = []
		ret.global_msg = []
		for (var k in req.body){
			table.push(req.body[k])
		}
		//console.log(table)
		// notifications("a", "b", "c", "d", "e", "f")
		// 	.then ((res) => {console.log(res)})
		//if (req.session.token == req.headers["x-access-token"]){
			if (table.length > 0){
				let subject = ''
				User.getUser("WHERE id="+table[0], (result) => {
					if (result !== undefined){
						switch(table[1]){
							case "booking":
								subject = "Demande de booking !"
								break;
							case "rdv":
								subject = "Demande de rendez-vous !"
								break;
						}
						ret.success.push(true)
						ret.global_msg.push("Mail envoyé !")
						res.send(ret)
					}else{
						ret.success.push(false)
						ret.global_msg.push("Utilisateur introuvable !")
						res.send(ret)
					}
				})
			}else{
				ret.success.push(false)
				ret.global_msg.push("Fause requête !")
				res.send(ret)
			}
		// }else{
		// 	ret.success.push(false)
		// 	ret.global_msg.push("Token compromised !")
		// 	res.send(ret)
		// }
})
/*function createMessagePlainText(events, userInfo, action, typeMessage){
	let ret = 'Salut '+userInfo.prenom+' '+userInfo.nom+', \n'
	if (typeMessage == "rdv"){
		if (action == "accept")
			ret += 'Ta demande de rendez-vous a été acceptée !' + '\n'
		else
			ret += 'Ta demande de rendez-vous a été refusée !' + '\n'
	}else{
		if (action == "accept")
			ret += 'Ta demande de booking a été acceptée !' + '\n'
		else
			ret += 'Ta demande de booking a été refusée !' + '\n'
	}
	if (action == "accept"){
		ret += 'Dates : \n'
		for (var k in events){
			ret += 'Début : '+events[k].start+ ' Fin : '+events[k].end+'\n'
		}
	}
	ret += 'Bien cordialement, \n'
	ret += "LabelOnAir"
	return ret;
}
function createMessageHtmlText(events, userInfo, action, typeMessage){
	let ret = '<p>Salut <b>'+userInfo.prenom+' '+userInfo.nom+', </b></p>'
	if (typeMessage == "rdv"){
		if (action == "accept")
			ret += '<p>Ta demande de rendez-vous a été acceptée !</p>'
		else
			ret += '<p>Ta demande de rendez-vous a été refusée !</p>'
	}else{
		if (action == "accept")
			ret += '<p>Ta demande de booking a été acceptée !</p>'
		else
			ret += '<p>Ta demande de booking a été refusée !</p>'
	}
	if (action == "accept"){
		ret += '<p>Dates : </p>'
		for (k in events){
			ret += '<p>Début : '+events[k].start+ ' Fin : '+events[k].end+'</p>'
		}
	}
	ret += '<p>Bien cordialement, </p>'
	ret += "<p>LabelOnAir</p>"
	return ret;	
}*/
module.exports = router;