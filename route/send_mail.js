const nodemailer = require('nodemailer')
const express = require('express')
const User = require('../models/req_user')
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
		//console.log(table)
		if (table.length > 0){
			User.getUser("id="+table[0], (result) => {
				if (result !== undefined){
					// setup email data with unicode symbols
					let mailOptions = {
					    from: '"Automate 👻" <nepasrepondre@label-onair.com>', // sender address
					    to: '"'+result.nom+' '+result.prenom+'" <'+result.email+'>, <ijv6lvrhtrfvwaqq@ethereal.email>', // list of receivers
					    subject: 'Hello ✔', // Subject line
					    text: 'Hello world?', // plain text body
					    html: '<b>Hello world?</b>' // html body
					};
					//console.log(result[0].email);
					ret.res = result.email
					// send mail with defined transport object
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
module.exports = router;