const mailGen = require('./mail_generator.js')
const server = require('../server').server;
const io = require('socket.io')(server)

class Notif {
    constructor(events = null, objRecever, action = null, type, subject = null, sender = null){
        this.sender = sender;
        this.objRecever = objRecever;
        this.type = type;
        this.events = events;
        this.action = action;
        this.subject = subject;
    }
    sendEmail(path){
        const newLocal = new Promise((resolve, reject) => {
            let mail = mailGen.generateClassicHtmlTemplate(this.events, this.objRecever, this.action, this.type, path, this.subject);
            if (mail != null)
                resolve(mail);
            else {
                let err = "erreur grave dans le code !";
                reject(err);
            }
        });
       return newLocal;
    }
    sendNotif(){
        return Notif('+this.sender+','+this.recever+','+this.type+','+this.text+','+email+');
     }
} 

    exports.x = (events,objRecever,action,type,subject) => 
        new Notif(events,objRecever,action,type,subject).sendEmail('http://localhost:4000').then(
        (res) => {
            //console.log(res)
            io.sockets.emit('sendnotif')
        }, (err) => {
            console.log(err)
        }).catch((e) => {console.log(e)});
