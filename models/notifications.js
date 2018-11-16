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
   constructor (objReceiverOfAction, senderOfAction, type = null, action = null, events = null){
       this.events = events;
       this.objReceiver = objReceiverOfAction;
       this.action = action;
       this.type = type;
       this.sender = senderOfAction;
   }
   sendEmail (path){
    //let deferred = Promise.defer();    
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
                    html: html // html body
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        //console.log(ret);
                        throw ret
                    }else{
                        //ret.success.push(true)
                        //ret.global_msg.push("Message sent: "+info.messageId, "Preview URL: "+nodemailer.getTestMessageUrl(info))
                        ret = {
                            receiverAction: {id: this.objReceiver.id, nom: this.objReceiver.nom},
                            senderAction: {id:this.sender.id, nom: this.sender.nom},
                            msg: result.subject,
                        }
                        //console.log('Message sent: %s', info.messageId);
                        // Preview only available when sending through an Ethereal account
                        //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));		    
                        //resolve(ret)
                        resolve(ret)
                    }
                    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                }) 
            })
        })
    }
}

exports.actions = {mail: (receiver, sender, type_message = null, action = null, events = null) => new Notif(receiver, sender, type_message, action, events).sendEmail("http://localhost:4000")  
    .then((result) => result, 
        (err) => err)
    .catch((err) => err)}