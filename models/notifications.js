const mail_gen = require("./mail_generator")
const axios = require('axios');
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'ijv6lvrhtrfvwaqq@ethereal.email', // generated ethereal user
        pass: 'y3HEPhr67AdcBswmcg' // generated ethereal password
    }
});
class Notif{
   constructor (objReceiverOfAction, senderOfAction, type = null, action = null, events = null, amount = 0){
       this.events = events;
       this.objReceiver = objReceiverOfAction;
       this.action = action;
       this.type = type;
       this.sender = senderOfAction;
       this.amount = amount;
   }
   sendEmail (path){
        return new Promise((resolve, reject) => {
            let result = mail_gen.generateClassicHtmlTemplate(this.events, this.objReceiver, this.sender, this.action, this.type, path)
            axios.get(path+"/generateMail", {params: result}).then((res) => {
                //console.log(res.data)
                let ret = {}
                let html = res.data
                let mailOptions = {
                    from: '"Automate 👻" <nepasrepondre@label-onair.com>', // sender address
                    to: '"'+this.objReceiver.nom+' '+this.objReceiver.prenom+'" <'+this.objReceiver.email+'>, <ijv6lvrhtrfvwaqq@ethereal.email>', // list of receivers
                    subject: result.subject, // Subject line
                    text: null, // plain text body
                    html: html, // html body
                    // attachments: [
					// 	{
					// 	  filePath: 'leCheminDuFichierAEnvoyer'
                    //     },
                    // ]
                };
                //console.log(mailOptions)
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                        throw error
                    }else{
                        ret = {
                            receiverAction: {id: this.objReceiver.id, nom: this.objReceiver.nom},
                            senderAction: {id:this.sender.id, nom: this.sender.nom},
                            msg: result.subject,
                            typeOfAction: this.type,
                        }
                        resolve(ret)
                    }
                    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                }) 
            })
        })
    }
    sendPaymentEmail (path){
        return new Promise((resolve, reject) => {
            let result = mail_gen.generateClassicHtmlPaymentTemplate(this.objReceiver, this.action, this.type, path, this.amount)
            //console.log(result)
            axios.get(path+"/generateMail", {params: result}).then((res) => {
                //console.log(res.data)
                let ret = {}
                let html = res.data
                let mailOptions = {
                    from: '"Automate 👻" <nepasrepondre@label-onair.com>', // sender address
                    to: '"'+this.objReceiver.nom+' '+this.objReceiver.prenom+'" <'+this.objReceiver.email+'>, <ijv6lvrhtrfvwaqq@ethereal.email>', // list of receivers
                    subject: result.subject, // Subject line
                    text: null, // plain text body
                    html: html, // html body
                    // attachments: [
					// 	{
					// 	  filePath: 'leCheminDuFichierAEnvoyer'
                    //     },
                    // ]
                };
                //console.log(mailOptions)
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                        throw error
                    }else{
                        ret = {
                            receiverAction: {id: this.objReceiver.id, nom: this.objReceiver.nom},
                            //senderAction: {id:this.sender.id, nom: this.sender.nom},
                            msg: result.subject,
                            typeOfAction: this.type,
                        }
                        resolve(ret)
                    }
                    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                })
            }).catch((err) => err)
        })
    }
}

exports.actions = {mail: (receiver, sender, type_message = null, action = null, events = null) => new Notif(receiver, sender, type_message, action, events).sendEmail("http://localhost:4000")  
    .then((result) => result, 
        (err) => err)
    .catch((err) => err),
    webhook_payment_mail: (receiver, type_message = null, action = null, amount = 0) => new Notif(receiver, null, type_message, action, null, amount).sendPaymentEmail("http://localhost:4000")
    .then((result) => result)
    .catch((err) => err)}