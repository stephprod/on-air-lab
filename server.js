const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const db = require('./db_start_engine')
const sass = require('node-sass')
const os = require('os');
const interfaces = os.networkInterfaces()
/*Variables routes*/
const register = require('./route/register')
const login = require('./route/login')
const forgottenPassword = require('./route/forgottenPassword')
const updatePassword = require('./route/updatePassword')
const search = require('./route/search')
const chat = require('./route/chat')
const audio_upload = require('./route/audio_upload')
const movie_module = require('./route/module_video')
const profile = require('./route/profile')
const infoPro = require('./route/info-pro')
const footer = require('./route/footer')
const offre = require('./route/create_off')
const tarif = require('./route/tarification')
const devis = require('./route/devis')
const img_upload = require('./route/image_upload')
const profile_secure = require('./route/profil_security')
const calendar = require('./route/calendar')
const drop_calendar = require('./route/drop_event_calendar')
const update_calendar = require('./route/update_event_calendar')
const calendar_dow = require('./route/calendar_dow')
const widget_book = require('./route/widget_calendar')
const cities = require('./route/cities')
const up_files = require('./route/upload_files')
const delete_document = require('./route/delete_document')
const delete_in_serv = require('./route/delete_files_in_serv')
const all_cp = require('./route/cp')
const prestations = require('./route/prestas')
const check = require('./route/check-in')
const w_search = require('./route/widget_search')
const devis_request = require('./route/devis_request')
const logout = require('./route/logout')
const delete_account = require('./route/delete_account')
const module_actions = require('./route/action_in_module')
const payment_recap = require('./route/payment_recap')
const mailer = require('./route/send_mail')
const payment = require('./route/payment')
const mail_template_generator = require('./route/generate_mail')
/*Modeles*/
const User = require('./models/req_user')
// SECURE HTTP POUR SOCKET IO
const http = require('http').Server(app)
const io = require('socket.io')(http)
//PROMISE http client
const axios = require('axios');
//NOTRE MOTEUR DE TEMPLATE
app.set('view engine', 'ejs')


//NOS MIDDLEWARES
app.use('/asset', express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
let sess = session({
  secret: 'SecureKeyStarlife',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // METTRE A TRUE POUR HTTPS
})

//CREATION D UNE SESSION PERMANENTE POUR LA SOCKET
io.use((socket, next) => {
	sess(socket.request, socket.request.res, next)
})

// SET SESSION
app.use(sess)

// NOS ROUTES
app.use('/', register)
app.use('/', login)
app.use('/', forgottenPassword)
app.use('/', updatePassword)
app.use('/', search)
app.use('/', chat)
app.use('/', audio_upload)
app.use('/', movie_module)
app.use('/', footer)
app.use('/', infoPro)
app.use('/', profile)
app.use('/', offre)
app.use('/', tarif)
app.use('/', devis)
app.use('/', img_upload)
app.use('/', profile_secure)
app.use('/', calendar)
app.use('/', drop_calendar)
app.use('/', update_calendar)
app.use('/', calendar_dow)
app.use('/', widget_book)
app.use('/', cities)
app.use('/', up_files)
app.use('/', delete_document)
app.use('/', delete_in_serv)
app.use('/', all_cp)
app.use('/', prestations)
app.use('/', check)
app.use('/', w_search)
app.use('/', devis_request)
app.use('/', logout)
app.use('/', delete_account)
app.use('/', module_actions)
app.use('/', payment_recap)
app.use('/', mailer)
app.use('/', payment)
app.use('/', mail_template_generator)
app.get('/', (request, response) => {
    response.locals.session = request.session
	response.render('pages/index')
})
app.get('/index', (request, response) => {
    response.locals.session = request.session
	response.render('pages/index')
})

app.get('*', function(req, res){
    res.status('404').send('404 Not Found !')
})

//OBJET USER POUR LES MESSAGES PRIVE
let userGlobal = []
let tabCorresp = []
// EMESSION DE SOCKET
function getPreviousMsg(len, type, id_room, callback)
{
    switch (type){
        case 1:
        case 2:
        case 3:
            User.getFirstPreviousMsgPro(id_room, len, callback)
            break;
        case 4:
            User.getFirstPreviousMsgArt(id_room, len, callback)
            break;
        default:
            User.getFirstPreviousMsgArt(id_room, len, callback)
            break;
    }
}
function getPreviousMsgAdmin(len, id_user, id_room, callback)
{
    User.getFirstPreviousMsgAdmin(id_room, id_user, len, callback)
}
io.sockets.on('connection', function (socket) {
    // QUAND LE USER SE CO DANS LOGIN ET ARRIVE SUR LA PAGE DU CHAT
    socket.on('adduser', function(id, type){
        let user = {}
        user.userId = id;
        user.userType = type;
        socket.user = user;
        //console.log("Socket ID du GARS "+socket.id);
        let p
        if (type == 2 || type == 1 || type == 3){
                User.getRoomForPro('`rooms`.`with_userid`='+id+' GROUP BY `rooms`.`id_room`'
                ,(result) => {
                    if (result == undefined || !result){
                        console.log("--------------------------")
                        console.log("AUCUNE ROOM NE CORRESPOND")
                        console.log("--------------------------")
                    }
                    else{
                        let room = []
                        tabCorresp = []
                        if (id != 1){
                            room.push(1, 1, "Admin", "admin", 1, "Modérateur", 0)
                            setTimeout((function(room){
                                return function(){
                                    getPreviousMsgAdmin(1, id, 1, (result2) => {
                                        if (result2.length > 0){
                                            room.push(result2[0].id_message)
                                            room.push(result2[0].message_txt)
                                        }
                                        else
                                        {
                                            room.push(null, 'Aucun message.')
                                        }
                                        tabCorresp.push(room)
                                        //socket.emit('updaterooms', tabCorresp, 1, null);
                                    })
                                };
                            }) (room), 100);
                        }
                        //console.log("---------Console ROOMS for user "+id+"---------")
                        //console.log(result.length > 0 ? result[0].id_room : "Aucune room")
                        //console.log("-------------------------------------")
                        //console.log("--------------Console MEMBERS-------------")
                        //console.log(result.length > 0 ? result[0].id : "Aucun membre")
                        for(k in result){
                            room = []
                            room.push(result[k].id)
                            room.push(result[k].id_room)
                            room.push(result[k].nom)
                            room.push(result[k].prenom)
                            room.push(result[k].id_user_type)
                            room.push(result[k].libelle)
                            room.push(result[k].payment_module)
                            //FONCTION DE CLOSURE POUR PERMETTRE LA RECUPERATION DES RSLT AVANT ITERATION DE LA BOUCLE
                            setTimeout((function(k, room){
                                return function(){
                                    getPreviousMsg(1, socket.user.userType, result[k].id_room, (result2) => {
                                        if (result2.length > 0){
                                            room.push(result2[0].id_message)
                                            room.push(result2[0].message_txt)
                                        }
                                        else
                                        {
                                            room.push(null, 'Aucun message.')
                                        }
                                        //console.log("-------------Console TAB CORRESPONDANTS---------")
                                        //console.log(k)
                                        //console.log(result2)
                                        //console.log(room)
                                        tabCorresp.push(room)
                                        //console.log(tabCorresp)
                                        //console.log("-----------------------------------------------")
                                        if (k == result.length - 1){
                                            //console.log(tabCorresp)
                                            socket.emit('updaterooms', tabCorresp, socket.room, null);
                                        }
                                   })
                                };
                            }) (k, room), 100);
                        }
                        socket.room = 1
                        // AJOUT DU CLIENT DANS LA GLOBAL LIST
                        let userInfos = {}
                        let coresp = {}
                        coresp.nom = "Admin";
                        coresp.prenom = "admin";
                        coresp.id_coresp = 1;
                        userInfos.socket = socket.id
                        userInfos.id_user = id
                        userGlobal.push(userInfos)
                        //console.log(userGlobal)
                        // ENVOI DU CLIENT DANS LA ROOM 1
                        socket.join(socket.room)
                        // AFFICHE LE CLIENT CONNECTE
                        //let data = { txt : 'you have connected to 1', user_sender: 'SERVER',
                        //    user_receiver : socket.user.userId}
                        //socket.emit('updatechat', coresp, data);
                        // AFFICHE SI UN AUTRE CLIENT EST CO
                        //data.txt = id + ' has connected to this room'
                        //data.user_receiver = socket.user.userId
                        //socket.broadcast.to(socket.room).emit('updatechat', coresp, data);
                        //socket.emit('updaterooms', tabCorresp, socket.room, coresp);
                        }
                    })
        }
        else if (type == 4){
            User.getRoomForArt('`rooms`.`userid`='+id+' GROUP BY `rooms`.`id_room`'
                , (result) => {
                    if (result == undefined || !result){
                        console.log("--------------------------")
                        console.log("AUCUNE ROOM NE CORRESPOND")
                        console.log("--------------------------")
                    }else{
                        let room = []
                        tabCorresp = []
                        if (id != 1){
                            room.push(1, 1, "Admin", "admin", 1, "Modérateur", 0)
                            setTimeout((function(room){
                                return function(){
                                    getPreviousMsgAdmin(1, id, 1, (result2) => {
                                        if (result2.length > 0){
                                            room.push(result2[0].id_message)
                                            room.push(result2[0].message_txt)
                                        }
                                        else
                                        {
                                            room.push(null, 'Aucun message.')
                                        }
                                        tabCorresp.push(room)
                                        //socket.emit('updaterooms', tabCorresp, 1, null);
                                    })
                                };
                            }) (room), 100);
                        }
                        //console.log("---------Console ROOMS for user "+id+"---------")
                        //console.log(result.length > 0 ? result[0].id_room : "Aucune room")
                        //console.log("-------------------------------------")
                        //console.log("--------------Console MEMBERS-------------")
                        //console.log(result.length > 0 ? result[0].id : "Aucun membre")
                        for(k in result){
                            room = []
                            room.push(result[k].id)
                            room.push(result[k].id_room)
                            room.push(result[k].nom)
                            room.push(result[k].prenom)
                            room.push(result[k].id_user_type)
                            room.push(result[k].libelle)
                            room.push(result[k].payment_module)
                            //FONCTION DE CLOSURE POUR PERMETTRE LA RECUPERATION DES RSLT AVANT ITERATION DE LA BOUCLE
                            setTimeout((function(k, room){
                                return function(){
                                    getPreviousMsg(1, socket.user.userType, result[k].id_room, (result2) => {
                                        if (result2.length > 0){
                                            room.push(result2[0].id_message)
                                            room.push(result2[0].message_txt)
                                        }
                                        else
                                        {
                                            room.push(null, 'Aucun message.')
                                        }
                                        //console.log("-------------Console TAB CORRESPONDANTS------------")
                                        tabCorresp.push(room)
                                        //console.log(tabCorresp)
                                        //console.log("-----------------------------------------------")
                                        if (k == result.length - 1){
                                            //console.log(tabCorresp)
                                            socket.emit('updaterooms', tabCorresp, socket.room, null);
                                        }
                                   })
                                };
                            }) (k, room), 100);
                        }
                        socket.room = 1
                        // AJOUT DU CLIENT DANS LA GLOBAL LIST
                        let userInfos = {}
                        let coresp = {}
                        coresp.nom = "Admin";
                        coresp.prenom = "admin";
                        coresp.id_coresp = 1;
                        userInfos.socket = socket.id
                        userInfos.id_user = id
                        userGlobal.push(userInfos)
                        //console.log(userGlobal)
                        // ENVOI DU CLIENT DANS LA ROOM 1
                        //socket.join(socket.room)
                        // AFFICHE LE CLIENT CONNECTE
                        //let data = { txt : 'you have connected to 1', user_sender: 'SERVER',
                        //    user_receiver : socket.user.userId}
                        //socket.emit('updatechat', coresp, data);
                        // AFFICHE SI UN AUTRE CLIENT EST CO
                        //data.txt = id + ' has connected to this room'
                        //data.user_receiver = socket.user.userId
                        //socket.broadcast.to(socket.room).emit('updatechat', coresp, data);
                        //socket.emit('updaterooms', tabCorresp, socket.room, coresp); 
                    }
                })
            }
    });
    // quand le client émet 'sendchat', cela écoute et exécute
    socket.on('sendchat', function (data, userId, user_receiver, context) {
        data.user_sender = userId
        data.user_receiver = user_receiver.id_coresp
        data.id_r = socket.room
        let created_date = new Date();
        let userIdSender = userId;
        let userIdReceiver = user_receiver.id_coresp;
        let vide = null;
        //Table Messages
        let tableM = [];
        //Table Type_Message
        let tableT = [];
        let tableE = [];
        //Si tu es sur la room admin
        if (socket.room == 1){
            if (data.type_m === undefined)
            {
                tableM.push(userIdSender, userIdReceiver, data.txt, socket.room, vide, created_date);
                User.insertMessages(tableM, (result) => {
                    data.id_m = result
                    data.created = created_date
                    io.sockets.in(socket.id).emit('updatechat', user_receiver, data)
                    //console.log("ENVOI DU MESSAGE AU CALME!")
                    //console.log(result)
                })
            }
            else
            {
                switch (data.type_m){
                    case "audio":
                        tableT.push(data.type_m, data.path)
                        break;
                    case "video":
                        tableT.push(data.type_m, data.path)
                        break;
                    case "booking":
                    case "rdv":
                    case "rdv_offer":
                        break;
                    case "contact":
                        io.sockets.in(socket.id).emit('updatechat', user_receiver, data, context)
                        break;
                    default:
                        tableT.push(data.type_m, data.path)
                        break;
                }
                if (data.type_m != "rdv" && data.type_m != "booking" && data.type_m != "contact" && data.type_m != "rdv_offer"){
                    //INSERTION DU TYPE DE MESSAGE
                    User.insertTypeM(tableT ,(result) => {
                        //console.log("INSERTION DU TYPE DE MESSAGE  AUDIO AU CALME!")
                        //console.log("id du type "+result)
                        tableM.push(userIdSender, userIdReceiver, data.txt, socket.room, result, created_date);
                        User.insertMessages(tableM, (result) => {
                            data.id_m = result
                            data.created  = created_date
                            io.sockets.in(socket.id).emit('updatechat', user_receiver, data, context)
                        })
                    })
                }
            }
            //Si tu n'est pas l'administrateur
            if (userId != 1)
            {
                for( var i=0, len=userGlobal.length; i<len; ++i ){
                    var c = userGlobal[i]
                    if(c.id_user == userIdReceiver){
                        io.sockets.in(c.socket).emit('updatechat', user_receiver, data, context)
                        break;
                    }
                }
            }
            else
            {
                for( var i=0, len=userGlobal.length; i<len; ++i ){
                    var c = userGlobal[i]
                    if(c.id_user == userIdReceiver){
                        io.sockets.in(c.socket).emit('updatechat', user_receiver, data, context)
                        break;
                    }
                }
            }
            console.log('Tu es sur le chat administrateur !')
        }
        else{
            if (data.type_m === undefined)
            {
                tableM.push(userIdSender, userIdReceiver, data.txt, socket.room, vide, created_date);
                //CONTROLE A FAIRE
                User.insertMessages(tableM, (result) => {
                    data.id_m = result
                    data.created = created_date
                    io.sockets.in(socket.room).emit('updatechat', user_receiver, data)
                    //console.log("ENVOI DU MESSAGE AU CALME!")
                    //console.log(result)
                })
            }
            else{
                switch (data.type_m){
                    case "audio":
                        tableT.push(data.type_m, data.path)
                        break;
                    case "video":
                        tableT.push(data.type_m, data.path)
                        break;
                    case "rdv":
                    case "booking":
                    case "rdv_offer":
                        io.sockets.in(socket.room).emit('updatechat', user_receiver, data, context)
                        break;
                    case "devis_request":
                        io.sockets.in(socket.room).emit('updatechat', user_receiver, data, context)
                        break;
                    case "contact":
                        io.sockets.in(socket.room).emit('updatechat', user_receiver, data, context)
                        break;
                    default:
                        tableT.push(data.type_m, data.path)
                        break;
                }
                if (data.type_m != "rdv" && data.type_m != "booking" && data.type_m != "devis_request" && data.type_m != "contact" && data.type_m != "rdv_offer"){
                    User.insertTypeM(tableT ,(result) => {
                        tableM.push(userIdSender, userIdReceiver, data.txt, socket.room, result, created_date);
                        User.insertMessages(tableM, (result) => {
                            data.id_m = result
                            data.created = created_date
                            io.sockets.in(socket.room).emit('updatechat', user_receiver, data, context)
                            //console.log("ENVOI DU MESSAGE AUDIO AU CALME!")
                            //console.log(result)
                        })
                    })
                }
            }
        }
    });
    socket.on('update_preview_in_room',  (data, context) =>{
        for (k in tabCorresp){
            if (tabCorresp[k][1] == data.id_r){
                tabCorresp[k][6] = data.id_m
                tabCorresp[k][7] = data.txt
                if (data.id_r != 1)
                    io.sockets.in(data.id_r).emit('updatepreview', tabCorresp[k], context)
                else
                    socket.emit('updatepreview', tabCorresp[k], context)
                break;
            }
        }
    });
    socket.on('list_msg', (data, corespObj, type_user) => {
        let message = []
        getPreviousMsg(15, type_user, data, (result) => {
            //CHARGEMENT DES MESSAGES DE LA BDD UNIQUEMENT SUR LE CHGMT DE ROOM
            for (let k=result.length - 1; k >= 0; k--)
            {
                message = {
                    id_m: result[k].id_message,
                    id_type_m : result[k].id_type_m,
                    txt : result[k].message_txt,
                    created : result[k].created_at,
                    user_sender : result[k].iduser_send,
                    user_receiver : result[k].iduser_received,
                    type_m : result[k].type_m,
                    path : result[k].path,
                    content_m: result[k].content_m,
                    id_r : data
                }
                message.events = null
                message.servs = null
                //console.log(message)
                if (message.type_m == "rdv" || message.type_m == "booking" || message.type_m == "rdv_offer"){
                    message.events = []
                    setTimeout((function(message) {
                        return function(){
                            User.getEventsInTypeMessage(message.id_type_m, (result2) =>{
                                if (result2.length > 0){
                                    for (k in result2){
                                        let ev = {}
                                        ev.start = result2[k].start
                                        ev.end = result2[k].end
                                        ev.state = result2[k].acceptation
                                        message.events.push(ev)
                                    }
                                    message.request_state = message.events[0].state
                                    //console.log(message)
                                    io.sockets.in(socket.id).emit('update_eventstypemessage', message)
                                    if (message.type_m == "rdv_offer"){
                                        User.getOfferInTypeMessage(message.id_type_m, (result2) => {
                                            if (result2.length > 0){
                                                let offer = {}
                                                offer.id = result2[0].id_offre
                                                offer.titre = result2[0].titre
                                                offer.desc = result2[0].spe_off
                                                offer.prix = result2[0].prix_off
                                                message.offer = offer
                                                //console.log(message)
                                                io.sockets.in(socket.id).emit('update_eventstypeoffermessage', message)
                                            }
                                        })
                                    }
                               }
                            })
                        };
                    }) (message), 100);
                }else if(message.type_m == "devis_request"){
                    message.servs = []
                    setTimeout((function(message) {
                        return function(){
                            User.getServicesInTypeMessage(message.id_type_m, (result2) =>{
                                if (result2.length > 0){
                                    for (k in result2){
                                        let s = {}
                                        s.id = result2[k].id_service
                                        s.libelle = result2[k].nom_service
                                        message.servs.push(s)
                                    }
                                    //console.log(message)
                                    io.sockets.in(socket.id).emit('update_servicestypemessage', message)
                                }
                            })
                        };
                    }) (message), 100);
                }
                //console.log(message)
                io.sockets.in(socket.id).emit('updatechat',corespObj, message)
            }
            //console.log("----------------------------------------------------")
        });
    });

    socket.on('list_msg_admin', (data, corespObj, userId) => {
        let message = {}
        //console.log("-----------------LIST MESSAGES ADMIN-----------------")
        //console.log(userId)
        getPreviousMsgAdmin(15, userId, data, (result) => {
            //CHARGEMENT DES MESSAGES DE LA BDD UNIQUEMENT SUR LE SWITCH DE LA ROOM
            for (let k=result.length - 1; k >= 0; k--)
            {
                message = {
                    id_m: result[k].id_message,
                    id_type_m : result[k].id_type_m,
                    txt : result[k].message_txt,
                    created : result[k].created_at,
                    user_sender : result[k].iduser_send,
                    user_receiver : result[k].iduser_received,
                    type_m : result[k].type_m,
                    path : result[k].path,
                    content_m: result[k].content_m,
                    id_r : data
                }
                message.events = null
                message.user_request_info = null
                if (message.type_m == "rdv" || message.type_m == "booking"){
                    message.events = []
                    setTimeout((function(message) {
                        return function(){
                            User.getEventsInTypeMessage(message.id_type_m, (result2) =>{
                                if (result2.length > 0){
                                    for (k in result2){
                                        let ev = {}
                                        ev.start = result2[k].start
                                        ev.end = result2[k].end
                                        message.events.push(ev)
                                    }
                                    //console.log(message)
                                    io.sockets.in(socket.id).emit('update_eventstypemessage', message)
                                }
                            })
                        };
                    }) (message), 100);
                }
                else if(message.type_m == "contact"){
                    //console.log(socket.user)
                    if (socket.user.userType != 4){
                        setTimeout((function(message) {
                            return function (){
                                User.getUserInfoInTypeMessage(message.id_type_m, (result) =>{
                                    if (result.length > 0){
                                        let obj = {}
                                        obj.id = result[0].id,
                                        obj.nom = result[0].nom,
                                        obj.prenom = result[0].prenom,
                                        obj.type = result[0].type
                                        message.user_request_info = obj
                                        if (result[0].id_temp != null){
                                            message.id_temp = result[0].id_temp
                                            message.request_state = 0
                                        } else{
                                            message.request_state = -1
                                        }
                                        //console.log(message)
                                        io.sockets.in(socket.id).emit('update_contactstypemessage', message)
                                    }
                                })
                            };
                        }) (message), 100);
                    }else{
                        setTimeout((function(message) {
                            return function(){
                                User.getUserJoin("LEFT JOIN temp ON temp.id_user_dest=user.id WHERE user.id="+message.user_receiver+" AND temp.id_type_message="+message.id_type_m, (result2)=>{
                                    //console.log(result2)
                                    if (result2 != null){
                                        let obj = {}
                                        obj.id = message.user_receiver
                                        obj.nom = result2.nom
                                        obj.prenom = result2.prenom
                                        obj.type = result2.type
                                        message.user_request_info = obj
                                        if (result2.id_temp != null){
                                            message.id_temp = result2.id_temp
                                            message.request_state = 0
                                        } else{
                                            message.request_state = -1
                                        }
                                        //console.log(message)
                                        io.sockets.in(socket.id).emit('update_contactstypemessage', message)
                                    }
                                })
                            };
                        }) (message), 100)
                    }
                }
                //console.log(message)
                io.sockets.in(data).emit('updatechat',corespObj, message)
            }
            //console.log("----------------------------------------------------")
        });
    });

    socket.on('switchRoom', function(idUser, newroom, coresp){
        let data = {}
        if (socket.room != newroom){
            socket.leave(socket.room);
            socket.join(newroom);

            data.txt = 'you have connected to '+ newroom
            data.user_sender = "SERVER"
            data.user_receiver = idUser
            data.created = new Date()
            data.id_r = newroom
            socket.emit('updatechat', coresp, data);
            // envoyé un message à l'ancienne room
            data.id_r = socket.room
            data.txt = idUser+' has left this room'
            socket.broadcast.to(socket.room).emit('updatechat', coresp, data);
            // update socket session room title
            socket.room = newroom
            data.id_r = newroom
            data.txt = idUser+' has joined this room'
            socket.broadcast.to(newroom).emit('updatechat', coresp, data);
        }
    });

    socket.on('update_services', function(idUser, room, coresp){
        let data = {}
        User.get_servicesOfPro(coresp.id_coresp, (result) => {
            if (result.length > 0){
                socket.emit('updateservicesfront', result);
            }
        })
    });

    socket.on('update_modeles_devis', function(idUser, room, coresp){
        let data = {}
        User.get_devisOfPro(idUser, (result) => {
            if (result.length > 0){
                socket.emit('updatemodelesdevisfront', result);
            }
        })
    });

    // lorsque l'utilisateur se déconnecte
    socket.on('disconnect', function(){
        let coresp = {}
        let id_user = socket.user !== undefined ? socket.user.userId : 'null';
        coresp.nom = "SERVER";
        coresp.prenom = "SERVER";
        coresp.id_coresp = 1;
        //delete userGlobal[socket.userId];
        //console.log(socket)
        let data = {}
        // mettre à jour la liste des utilisateurs dans le chat, côté client
        io.sockets.emit('updateusers', userGlobal);
        // Affiche globalement que le client vient de quitter la room
        data.txt = id_user + ' has disconnected'
        data.user_sender = "SERVER"
        data.user_receiver = id_user
        data.created = new Date()
        socket.broadcast.to(socket.room).emit('updatechat', coresp, data);
        socket.leave(socket.room);
        // supprimer le nom d'utilisateur de la liste des noms d'utilisateur globaux
        for( var i=0, len=userGlobal.length; i<len; ++i ){
            var c = userGlobal[i]
            if(c.id_user == id_user){
                userGlobal.splice(i,1);
                break;
            }
        }
    });
});

var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}
//console.log(addresses);
http.listen(4000, function(){
  console.log('listening on :4000 jai secure en http')
})
//EXPORT FOR APP TESTING AND MAILING
module.exports = { httpGetRequest: function(path){
            return axios.get(path)
            .then((res) => res)
        },
    httpPostRequest: function(path, params){
            return axios.post(path, params, {headers: {"x-access-token": "dvsdvsvffv"}})
            .then((res) => res)
        },
    host: addresses,
    server: http
}
