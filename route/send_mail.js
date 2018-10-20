const nodemailer = require('nodemailer')
const express = require('express')
const User = require('../models/req_user')
const Mail = require('../models/mail_generator')
const router = express.Router()
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'ijv6lvrhtrfvwaqq@ethereal.email', // generated ethereal user
        pass: 'y3HEPhr67AdcBswmcg' // generated ethereal password
    }
});

router.route('/mail')
	.get((req, res) => {

     })
	.post((req, res) => {
		//console.log(req.body)
		let table = []
		let ret = {}
		ret.success = []
		ret.global_msg = []
		ret.res = {}
		for (k in req.body){
			table.push(req.body[k])
		}
		if (table.length > 0){
			let subject = '', text = '', html = ''
			User.getUser("id="+table[0], (result) => {
				if (result !== undefined){
					switch(table[1]){
						case "booking":
							subject = "Demande de booking !"
							break;
						case "rdv":
							subject = "Demande de rendez-vous !"
							break;
					}
					if (table[3] == "accept"){
						subject += ' ✔';
					}else{
						subject += ' X'
					}
					text = createMessagePlainText(table[2], result, table[3], table[1])
					Mail.generateClassicHtmlTemplate(table[2], result, table[3], table[1], 'http://'+req.hostname+':4000', subject)
					.then((result2) =>{
						//console.log(result2.data)
						html = result2.data
						// setup email data with unicode symbols
						ret.res = result.email
						let mailOptions = {
						    from: '"Automate 👻" <nepasrepondre@label-onair.com>', // sender address
						    to: '"'+result.nom+' '+result.prenom+'" <'+result.email+'>, <ijv6lvrhtrfvwaqq@ethereal.email>', // list of receivers
						    subject: subject, // Subject line
						    text: text, // plain text body
						    html: html // html body
						};
						transporter.sendMail(mailOptions, (error, info) => {
						    if (error) {
						    	ret.success.push(false)
						    	ret.global_msg.push("Erreur lors de l'envoi du message !")
						       	console.log(error);
						    }else{
						    	ret.success.push(true)
								ret.global_msg.push("Message sent: "+info.messageId, "Preview URL: "+nodemailer.getTestMessageUrl(info))
						    	//console.log('Message sent: %s', info.messageId);
							    // Preview only available when sending through an Ethereal account
							    //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));		    
						    }
						    res.send(ret)
						    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
						    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
						})
					})
					.catch((error) => console.log(error))
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
})
function createMessagePlainText(events, userInfo, action, typeMessage){
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
/*function createMessageHtmlText(events, userInfo, action, typeMessage){
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