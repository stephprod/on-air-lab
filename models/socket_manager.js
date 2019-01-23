const User = require('./req_user')
const notifications = require('./notifications').actions
class SocketManager{
    constructor(io_obj, sock, usglob){
        this.userGlobal = usglob
        this.tabCorresp = []
        this.admin = {id: 1, room: 1, firstName: "Admin", name: "admin", type: 1, type_libelle: "Modérateur", mail: "admin@label-onair.com", img_chat: "/asset/content/img/default_admin.png", dispo: 0};
        this.socket = sock
        this.io = io_obj
        this.Usr = User
    }
    static getIo(){
        return this.io;
    }
    static getPreviousMsg(len, type, id_room, callback, id_user = null)
    {
        switch (type){
            case 1:
                User.getFirstPreviousMsgForAdmin(id_user, len, callback)
                break;
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
    static getPreviousMsgFromInd(len, type, id_room, ind, callback, id_user = null){
        switch (type){
            case 1:
                User.getPreviousMsgForAdmin(id_user, ind, len, callback)
                break;
            case 2:
            case 3:
                User.getPreviousMsgPro(id_room, ind, len, callback)
                break;
            case 4:
                User.getPreviousMsgArt(id_room, ind, len, callback)
                break;
            default:
                User.getPreviousMsgArt(id_room, ind, len, callback)
                break;
        }
    }
    static getNextMsgFromInd(len, type, id_room, ind, callback, id_user = null){
        switch (type){
            case 1:
                User.getNextMsgForAdmin(id_user, ind, len, callback)
                break;
            case 2:
            case 3:
                User.getNextMsgPro(id_room, ind, len, callback)
                break;
            case 4:
                User.getNextMsgArt(id_room, ind, len, callback)
                break;
            default:
                User.getNextMsgArt(id_room, ind, len, callback)
                break;
        }
    }
    static getPreviousMsgAdmin(len, id_user, id_room, callback)
    {
        User.getFirstPreviousMsgAdmin(id_room, id_user, len, callback)
    }
    static getPreviousMsgAdminFromInd(len, id_user, id_room, ind, callback)
    {
        User.getPreviousMsgAdmin(id_room, id_user, ind, len, callback)
    }
    static getNextMsgAdminFromInd(len, id_user, id_room, ind, callback)
    {
        User.getNextMsgAdmin(id_room, id_user, ind, len, callback)
    }
    static show_latest_msg(result, data, len, size, src, socket, corespObj, io){ 
        for (let k=(len - 1); k >= 0; k--)
        {
            let message = {
                id_m: result[k].id_message,
                id_type_m : result[k].id_type_m,
                txt : result[k].message_txt,
                created : result[k].created_at,
                user_sender : {id: result[k].iduser_send},
                user_receiver : {id: result[k].iduser_received},
                type_m : result[k].type_m,
                path : result[k].path,
                content_m: result[k].content_m,
                id_r : data,
                id_payment: result[k].id_payment,
                pro_type: result[k].type
            }
            if (len == size && k == (len - 1) && (src == "latestMsg" || src == "previousMsg")){
                message.fullPrevious = false
            }else if(len < size && k == (len - 1) && (src == "latestMsg" || src == "previousMsg")){
                message.fullPrevious = true
            }else if(len == size && k == (len - 1) && src == "nextMsg"){
                message.fullPrevious = false
            }else if(len < size && k == (len - 1) && src == "nextMsg"){
                message.fullPrevious = false
            }else if(len == size && k == 0 && src == "latestMsg"){
                message.fullNext = true
            }else if(len < size && k == 0 && src == "latestMsg"){
                message.fullNext = true
            }else if(len == size && k == 0 && src == "previousMsg"){
                message.fullNext = false
            }else if(len < size && k == 0 && src == "previousMsg"){
                message.fullNext = false
            }else if(len == size && k == 0 && src == "nextMsg"){
                message.fullNext = false
            }else if(len < size && k == 0 && src == "nextMsg"){
                message.fullNext = true
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
            }else if(message.type_m == "payment"){
                User.getPaymentInTypeMessage(message, (result, msg, resolve, reject) =>{
                    //console.log(result)                
                    let obj = {}
                    if (result.length > 0){
                        obj.id = result[0].id
                        obj.desc = result[0].desc
                        obj.price = result[0].price
                        obj.type_t = result[0].type_transaction
                        msg.payment = obj
                        if (result[0].id_temp != null){
                            msg.id_temp = result[0].id_temp
                            msg.request_state = result[0].acceptation
                        }else{
                            msg.request_state = -1
                        }
                        //console.log(msg)
                        resolve(msg)
                    }else{
                        obj.id = 0,
                        obj.desc = "Une erreur est survenue lors de la récupération de la demande de paiement !",
                        obj.price = 0,
                        msg.payment = obj
                        reject(msg)
                    }
                }).then((mess) => {
                    io.sockets.in(socket.id).emit('update_paymentstypemessage', mess)
                }, (err) => {
                    io.sockets.in(socket.id).emit('update_paymentstypemessage', err)
                })
            }else if (message.type_m == "contact"){
                if (socket.request.session.userType != 4){
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
                            User.getUserJoin("LEFT JOIN temp ON temp.id_user_dest=user.id WHERE user.id="+message.user_receiver.id+" AND temp.id_type_message="+message.id_type_m, (result2)=>{
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
            io.sockets.in(socket.id).emit('updatechat', corespObj, message)
        }
    }
    static show_msg(result, data, len, size, src, socket, corespObj, io){
        for (let k=0; k < len; k++)
        {
            let message = {
                id_m: result[k].id_message,
                id_type_m : result[k].id_type_m,
                txt : result[k].message_txt,
                created : result[k].created_at,
                user_sender : {id: result[k].iduser_send},
                user_receiver : {id: result[k].iduser_received},
                type_m : result[k].type_m,
                path : result[k].path,
                content_m: result[k].content_m,
                id_r : data,
                id_payment: result[k].id_payment,
                pro_type: result[k].type
            }
            if (len == size && k == 0 && (src == "latestMsg" || src == "previousMsg")){
                message.fullPrevious = false
            }else if(len < size && k == 0 && (src == "latestMsg" || src == "previousMsg")){
                message.fullPrevious = true
            }else if(len == size && k == 0 && src == "nextMsg"){
                message.fullPrevious = false
            }else if(len < size && k == 0 && src == "nextMsg"){
                message.fullPrevious = false
            }else if(len == size && k == (len - 1) && src == "latestMsg"){
                message.fullNext = true
            }else if(len < size && k == (len - 1) && src == "latestMsg"){
                message.fullNext = true
            }else if(len == size && k == (len - 1) && src == "previousMsg"){
                message.fullNext = false
            }else if(len < size && k == (len - 1) && src == "previousMsg"){
                message.fullNext = false
            }else if(len == size && k == (len - 1) && src == "nextMsg"){
                message.fullNext = false
            }else if(len < size && k == (len - 1) && src == "nextMsg"){
                message.fullNext = true
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
            }else if(message.type_m == "payment"){
                User.getPaymentInTypeMessage(message, (result, msg, resolve, reject) =>{
                    //console.log(result)                
                    let obj = {}
                    if (result.length > 0){
                        obj.id = result[0].id
                        obj.desc = result[0].desc
                        obj.price = result[0].price
                        obj.type_t = result[0].type_transaction
                        msg.payment = obj
                        if (result[0].id_temp != null){
                            msg.id_temp = result[0].id_temp
                            msg.request_state = result[0].acceptation
                        }else{
                            msg.request_state = -1
                        }
                        //console.log(msg)
                        resolve(msg)
                    }else{
                        obj.id = 0,
                        obj.desc = "Une erreur est survenue lors de la récupération de la demande de paiement !",
                        obj.price = 0,
                        msg.payment = obj
                        reject(msg)
                    }
                }).then((mess) => {
                   io.sockets.in(socket.id).emit('update_paymentstypemessage', mess)
                }, (err) => {
                   io.sockets.in(socket.id).emit('update_paymentstypemessage', err)
                })
            }else if (message.type_m == "contact"){
                if (socket.request.session.userType != 4){
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
                            User.getUserJoin("LEFT JOIN temp ON temp.id_user_dest=user.id WHERE user.id="+message.user_receiver.id+" AND temp.id_type_message="+message.id_type_m, (result2)=>{
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
           io.sockets.in(socket.id).emit('updatechat', corespObj, message)
        }
    }
    static show_latest_msg_admin(result, data, len, size, src, socket, corespObj, io){
        for (let k=(len - 1); k >= 0; k--)
        {
            let message = {
                id_m: result[k].id_message,
                id_type_m : result[k].id_type_m,
                txt : result[k].message_txt,
                created : result[k].created_at,
                user_sender : {id: result[k].iduser_send},
                user_receiver : {id: result[k].iduser_received},
                type_m : result[k].type_m,
                path : result[k].path,
                content_m: result[k].content_m,
                id_r : data,
                id_payment: result[k].id_payment,
            }
            if (len == size && k == (len - 1) && (src == "latestMsg" || src == "previousMsg")){
                message.fullPrevious = false
            }else if(len < size && k == (len - 1) && (src == "latestMsg" || src == "previousMsg")){
                message.fullPrevious = true
            }else if(len == size && k == (len - 1) && src == "nextMsg"){
                message.fullPrevious = false
            }else if(len < size && k == (len - 1) && src == "nextMsg"){
                message.fullPrevious = false
            }else if(len == size && k == 0 && src == "latestMsg"){
                message.fullNext = true
            }else if(len < size && k == 0 && src == "latestMsg"){
                message.fullNext = true
            }else if(len == size && k == 0 && src == "previousMsg"){
                message.fullNext = false
            }else if(len < size && k == 0 && src == "previousMsg"){
                message.fullNext = false
            }else if(len == size && k == 0 && src == "nextMsg"){
                message.fullNext = false
            }else if(len < size && k == 0 && src == "nextMsg"){
                message.fullNext = true
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
            }else if(message.type_m == "contact"){
                //console.log(this.socket.request.session)
                if (socket.request.session.userType != 4){
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
                            User.getUserJoin("LEFT JOIN temp ON temp.id_user_dest=user.id WHERE user.id="+message.user_receiver.id+" AND temp.id_type_message="+message.id_type_m, (result2)=>{
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
            }else if(message.type_m == "payment"){
                User.getPaymentInTypeMessage(message.id_payment, message.id_type_m, (result) =>{
                    if (result.length > 0){
                        let obj = {}
                        obj.id = result[0].id
                        obj.desc = result[0].nom
                        obj.price = result[0].prenom
                        obj.type_t = result[0].type_transaction
                        message.payment = obj
                        if (result[0].id_temp != null){
                            message.id_temp = result[0].id_temp
                            message.request_state = 0
                        } else{
                            message.request_state = -1
                        }
                        //console.log(message)
                       io.sockets.in(socket.id).emit('socket_update_paymentstypemessage', message)
                    }
                })
            }
            //console.log(message)
           io.sockets.in(socket.id).emit('updatechat', corespObj, message)
        }
    }
    static show_msg_admin(result, data, len, size, src, socket, corespObj, io){
        for (let k=0; k < len; k++)
        {
            let message = {
                id_m: result[k].id_message,
                id_type_m : result[k].id_type_m,
                txt : result[k].message_txt,
                created : result[k].created_at,
                user_sender : {id: result[k].iduser_send},
                user_receiver : {id: result[k].iduser_received},
                type_m : result[k].type_m,
                path : result[k].path,
                content_m: result[k].content_m,
                id_r : data,
                id_payment: result[k].id_payment,
            }
            if (len == size && k == 0 && (src == "latestMsg" || src == "previousMsg")){
                message.fullPrevious = false
            }else if(len < size && k == 0 && (src == "latestMsg" || src == "previousMsg")){
                message.fullPrevious = true
            }else if(len == size && k == 0 && src == "nextMsg"){
                message.fullPrevious = false
            }else if(len < size && k == 0 && src == "nextMsg"){
                message.fullPrevious = false
            }else if(len == size && k == (len - 1) && src == "latestMsg"){
                message.fullNext = true
            }else if(len < size && k == (len - 1) && src == "latestMsg"){
                message.fullNext = true
            }else if(len == size && k == (len - 1) && src == "previousMsg"){
                message.fullNext = false
            }else if(len < size && k == (len - 1) && src == "previousMsg"){
                message.fullNext = false
            }else if(len == size && k == (len - 1) && src == "nextMsg"){
                message.fullNext = false
            }else if(len < size && k == (len - 1) && src == "nextMsg"){
                message.fullNext = true
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
            }else if(message.type_m == "contact"){
                //console.log(this.socket.request.session)
                if (socket.request.session.userType != 4){
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
                            User.getUserJoin("LEFT JOIN temp ON temp.id_user_dest=user.id WHERE user.id="+message.user_receiver.id+" AND temp.id_type_message="+message.id_type_m, (result2)=>{
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
            }else if(message.type_m == "payment"){
                User.getPaymentInTypeMessage(message.id_payment, message.id_type_m, (result) =>{
                    if (result.length > 0){
                        let obj = {}
                        obj.id = result[0].id
                        obj.desc = result[0].nom
                        obj.price = result[0].prenom
                        obj.type_t = result[0].type_transaction
                        message.payment = obj
                        if (result[0].id_temp != null){
                            message.id_temp = result[0].id_temp
                            message.request_state = 0
                        } else{
                            message.request_state = -1
                        }
                        //console.log(message)
                       io.sockets.in(socket.id).emit('socket_update_paymentstypemessage', message)
                    }
                })
            }
            //console.log(message)
           io.sockets.in(socket.id).emit('updatechat', corespObj, message)
        }
    }
    list_latest_msg(data, corespObj, type_user){
        SocketManager.getPreviousMsg(15, type_user, data, (result) => {
            let len = result.length
            SocketManager.show_latest_msg(result, data, len, 15, "latestMsg", this.socket,  corespObj, this.io)
        })
    }
    list_latest_msg_for_admin(data, corespObj, type_user){
        SocketManager.getPreviousMsg(15, type_user, data, (result) => {
            let len = result.length
            SocketManager.show_latest_msg(result, data, len, 15, "latestMsg", this.socket, corespObj, this.io)
        }, corespObj.id_coresp)
    }
    list_msg(socket, result, corespObj, data, src, size){
        let len = result.length;
        SocketManager.show_msg(result, data, len, size, src, socket, corespObj, this.io)
    }
    list_latest_msg_admin(data, corespObj, userId){
        SocketManager.getPreviousMsgAdmin(15, userId, data, (result) =>{
            let len = result.length;
            SocketManager.show_latest_msg_admin(result, data, len, 15, "latestMsg", this.socket, this.corespObj, this.io)
        })
    }
    list_msg_admin(socket, result, corespObj, data, src, size){
        let len = result.length;
        SocketManager.show_msg_admin(result, data, len, size, src, socket, corespObj, this.io)
    }
    add_user(id, type){
        // supprimer le nom d'utilisateur de la liste des noms d'utilisateur globaux s'il existe déjà
        for( var i=0, len=this.userGlobal.length; i<len; ++i ){
            var c = this.userGlobal[i]
            if(c.id_user == id){
                this.userGlobal.splice(i,1);
                break;
            }
        }
        let user = {}
        user.userId = id;
        user.userType = type;
        this.socket.user = user;
        //console.log("Socket ID du GARS "+this.socket.id);
        if (type == 2 || type == 3){
            User.getRoomForPro('`rooms`.`with_userid`='+id+' GROUP BY `rooms`.`id_room`'
                ,(result) => {
                if (result == undefined || !result){
                    console.log("--------------------------")
                    console.log("AUCUNE ROOM NE CORRESPOND")
                    console.log("--------------------------")
                }else{
                    let room = []
                    this.tabCorresp = []
                    if (type != 1){
                        room.push(this.admin.id, this.admin.room, this.admin.firstName, this.admin.name, this.admin.type, this.admin.type_libelle, this.admin.mail, this.admin.img_chat, this.admin.dispo)
                        setTimeout((function(room, admin, getPreviousMsgAdmin, tabCorresp, sock){
                            return function(){
                                getPreviousMsgAdmin(1, id, admin.room, (result2) => {
                                    if (result2.length > 0){
                                        room.push(result2[0].id_message)
                                        room.push(result2[0].message_txt)
                                    }
                                    else
                                    {
                                        room.push(null, 'Aucun message.')
                                    }
                                    tabCorresp.push(room)
                                    sock.emit('updaterooms', tabCorresp);
                                })
                            };
                        }) (room, this.admin, SocketManager.getPreviousMsgAdmin, this.tabCorresp, this.socket), 100);
                    }
                    for(var k in result){
                        room = []
                        room.push(result[k].id)
                        room.push(result[k].id_room)
                        room.push(result[k].nom)
                        room.push(result[k].prenom)
                        room.push(result[k].id_user_type)
                        room.push(result[k].libelle)
                        room.push(result[k].email)
                        room.push(result[k].img_chat)
                        room.push(result[k].disponibilite)
                        //FONCTION DE CLOSURE POUR PERMETTRE LA RECUPERATION DES RSLT AVANT ITERATION DE LA BOUCLE
                        setTimeout((function(k, room, getPreviousMsg, tabCorresp, sock){
                            return function(){
                                getPreviousMsg(1, type, result[k].id_room, (result2) => {
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
                                    //console.log(this.tabCorresp)
                                    //console.log("-----------------------------------------------")
                                    if (k == result.length - 1){
                                        //console.log(this.tabCorresp)
                                        sock.emit('updaterooms', tabCorresp);
                                    }
                                })
                            };
                        }) (k, room, SocketManager.getPreviousMsg, this.tabCorresp, this.socket), 100);
                    }
                    //this.socket.emit('updaterooms', this.tabCorresp);
                    this.socket.room = 1
                    // AJOUT DU CLIENT DANS LA GLOBAL LIST
                    let userInfos = {}
                    let coresp = {}
                    coresp.nom = "Admin";
                    coresp.prenom = "admin";
                    coresp.id_coresp = 1;
                    userInfos.socket = this.socket.id
                    userInfos.id_user = id
                    this.userGlobal.push(userInfos)
                    //console.log(this.userGlobal)
                    // ENVOI DU CLIENT DANS LA ROOM 1
                    this.socket.join(this.socket.room)
                }
            })
        }else if (type == 4){
            User.getRoomForArt('`rooms`.`userid`='+id+' GROUP BY `rooms`.`id_room`'
                , (result) => {
                if (result == undefined || !result){
                    console.log("--------------------------")
                    console.log("AUCUNE ROOM NE CORRESPOND")
                    console.log("--------------------------")
                }else{
                    let room = []
                    this.tabCorresp = []
                    room.push(this.admin.id, this.admin.room, this.admin.firstName, this.admin.name, this.admin.type, this.admin.type_libelle, this.admin.mail, this.admin.img_chat, this.admin.dispo)
                    setTimeout((function(room, admin, getPreviousMsgAdmin, tabCorresp, sock){
                        return function(){
                            getPreviousMsgAdmin(1, id, admin.room, (result2) => {
                                if (result2.length > 0){
                                    room.push(result2[0].id_message)
                                    room.push(result2[0].message_txt)
                                }
                                else
                                {
                                    room.push(null, 'Aucun message.')
                                }
                                tabCorresp.push(room)
                                //console.log(tabCorresp)
                                sock.emit('updaterooms', tabCorresp);
                            })
                        };
                    }) (room, this.admin, SocketManager.getPreviousMsgAdmin, this.tabCorresp, this.socket), 100);
                    for(var k in result){
                        room = []
                        room.push(result[k].id)
                        room.push(result[k].id_room)
                        room.push(result[k].nom)
                        room.push(result[k].prenom)
                        room.push(result[k].id_user_type)
                        room.push(result[k].libelle)
                        room.push(result[k].email)
                        room.push(result[k].img_chat)
                        room.push(result[k].disponibilite)
                        //FONCTION DE CLOSURE POUR PERMETTRE LA RECUPERATION DES RSLT AVANT ITERATION DE LA BOUCLE
                        setTimeout((function(k, room, getPreviousMsg, tabCorresp, sock){
                            return function(){
                                getPreviousMsg(1, sock.user.userType, result[k].id_room, (result2) => {
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
                                        sock.emit('updaterooms', tabCorresp);
                                    }
                                })
                            };
                        }) (k, room, SocketManager.getPreviousMsg, this.tabCorresp, this.socket), 100);
                    }
                    this.socket.room = 1
                    // AJOUT DU CLIENT DANS LA GLOBAL LIST
                    let userInfos = {}
                    let coresp = {}
                    coresp.nom = "Admin";
                    coresp.prenom = "admin";
                    coresp.id_coresp = 1;
                    userInfos.socket = this.socket.id
                    userInfos.id_user = id
                    this.userGlobal.push(userInfos)
                }
            })
        }else if(type == 1){
            User.getRoomForAdmin('`messages`.`iduser_received`='+id+' GROUP BY `user`.`id`', (result) =>{
                let room;
                for(var k in result){
                    room = []
                    room.push(result[k].id)
                    room.push(1)
                    room.push(result[k].nom)
                    room.push(result[k].prenom)
                    room.push(result[k].id_user_type)
                    room.push(result[k].libelle)
                    room.push(result[k].email)
                    room.push(result[k].img_chat)
                    //FONCTION DE CLOSURE POUR PERMETTRE LA RECUPERATION DES RSLT AVANT ITERATION DE LA BOUCLE
                    setTimeout((function(k, room, getPreviousMsg, tabCorresp, sock){
                        return function(){
                            getPreviousMsg(sock.user.userId, sock.user.userType, 1, (result2) => {
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
                                    sock.emit('updaterooms', tabCorresp);
                                }
                            }, result[k].id)
                        };
                    }) (k, room, SocketManager.getPreviousMsg, this.tabCorresp, this.socket), 100);
                }
                this.socket.room = 1
                // AJOUT DU CLIENT DANS LA GLOBAL LIST
                let userInfos = {}
                // let coresp = {}
                // coresp.nom = "Admin";
                // coresp.prenom = "admin";
                // coresp.id_coresp = 1;
                userInfos.socket = this.socket.id
                userInfos.id_user = id
                this.userGlobal.push(userInfos)
            })
        }
    }
    send_chat(data, userId, user_receiver, context){
        // console.log(this.socket.request.session)
        data.user_sender = {id: userId, nom: this.socket.request.session.userName, prenom:this.socket.request.session.userFirstName, email:this.socket.request.session.userMail}
        data.user_receiver = {id: user_receiver.id_coresp, nom: user_receiver.nom, prenom: user_receiver.prenom, email: user_receiver.mail}
        data.id_r = this.socket.room
        let created_date = new Date();
        let userIdSender = userId;
        let userIdReceiver = user_receiver.id_coresp;
        let vide = null;
        //Table Messages
        let tableM = [];
        //Table Type_Message
        let tableT = [];
        //console.log(this.socket.room)
        //Si tu es sur la room admin
        if (this.socket.room == 1){
            if (data.type_m === undefined)
            {
                tableM.push(userIdSender, userIdReceiver, data.txt, this.socket.room, vide, created_date);
                User.insertMessages(tableM, (result) => {
                    data.id_m = result
                    data.created = created_date
                    notifications.mail(data.user_receiver, data.user_sender, data.type_m)
                    .then((res) =>{
                        // console.log(res)
                        data.notif = res
                       this.io.sockets.in(this.socket.id).emit('updatechat', user_receiver, data)
                    }).catch((err) => console.log(err));
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
                    case "payment":
                        notifications.mail(data.user_receiver, data.user_sender, data.type_m, null, data.events)
                        .then((res) => {
                            if (!(res instanceof Error))
                                data.notif = res
                            this.io.sockets.in(this.socket.id).emit('updatechat', user_receiver, data, context)
                        }).catch((err) => {
                            console.log(err)
                        })
                        break;
                    case "contact":
                        //console.log(data);
                        // notifications.mail(data.user_receiver, data.user_sender, data.type_m)
                        // .then((result2) => {
                        //     data.notif = result2
                        //     for( var i=0, len=this.userGlobal.length; i<len; ++i ){
                        //         var c = this.userGlobal[i]
                        //         if(c.id_user == userIdReceiver){
                        //             this.io.sockets.in(c.socket).emit('updatechat', user_receiver, data, context)
                        //             break;
                        //         }
                        //     }
                        //    //this.io.sockets.in(this.socket.id).emit('updatechat', user_receiver, data, context)
                        // }).catch((err) => {
                        //     console.log(err)
                        // })
                        break;
                    default:
                        tableT.push(data.type_m, data.path)
                        break;
                }
                if (data.type_m != "rdv" && 
                    data.type_m != "booking" && 
                    data.type_m != "devis_request" && 
                    data.type_m != "contact" && 
                    data.type_m != "rdv_offer" && 
                    data.type_m != "payment"){
                    //INSERTION DU TYPE DE MESSAGE
                    User.insertTypeM(tableT ,(result) => {
                        //console.log("INSERTION DU TYPE DE MESSAGE  AUDIO AU CALME!")
                        //console.log("id du type "+result)
                        tableM.push(userIdSender, userIdReceiver, data.txt, this.socket.room, result, created_date);
                        User.insertMessages(tableM, (result) => {
                            data.id_m = result
                            data.created  = created_date
                            notifications.mail(data.user_receiver, data.user_sender, data.type_m)
                            .then((res) =>{
                                data.notif = res
                               this.io.sockets.in(this.socket.room).emit('updatechat', user_receiver, data, context)
                            }).catch((err) => console.log(err));
                        })
                    })
                }
            }
            // console.log(this.userGlobal)
            // console.log(data)
            //Si tu n'est pas l'administrateur
            if (userId != 1)
            {
                for( var i=0, len=this.userGlobal.length; i<len; ++i ){
                    var c = this.userGlobal[i]
                    if(c.id_user == userIdReceiver){
                       this.io.sockets.in(c.socket).emit('updatechat', user_receiver, data, context)
                        break;
                    }
                }
            }
            else
            {
                for(i=0, len=this.userGlobal.length; i<len; ++i ){
                    c = this.userGlobal[i]
                    if(c.id_user == userIdReceiver){
                       this.io.sockets.in(c.socket).emit('updatechat', user_receiver, data, context)
                        break;
                    }
                }
            }
            console.log('Tu es sur le chat administrateur !')
        }
        else{
            if (data.type_m === undefined)
            {
                tableM.push(userIdSender, userIdReceiver, data.txt, this.socket.room, vide, created_date);
                //CONTROLE A FAIRE
                User.insertMessages(tableM, (result) => {
                    data.id_m = result
                    data.created = created_date
                    notifications.mail(data.user_receiver, data.user_sender)
                    .then((res) =>{
                        data.notif = res
                       this.io.sockets.in(this.socket.room).emit('updatechat', user_receiver, data)
                    }).catch((err) => console.log(err));
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
                    case "payment":
                    case "devis_request":
                    case "contact":
                        notifications.mail(data.user_receiver, data.user_sender, data.type_m, null, data.events)
                        .then((res) => {
                            // console.log(res)
                            if (!(res instanceof Error))
                                data.notif = res
                           this.io.sockets.in(this.socket.room).emit('updatechat', user_receiver, data, context)
                        }).catch((err) => {
                            console.log(err)
                        })
                        break;
                    default:
                        tableT.push(data.type_m, data.path)
                        break;
                }
                if (data.type_m != "rdv" && 
                        data.type_m != "booking" && 
                        data.type_m != "devis_request" && 
                        data.type_m != "contact" && 
                        data.type_m != "rdv_offer" && 
                        data.type_m != "payment"){
                    User.insertTypeM(tableT ,(result) => {
                        tableM.push(userIdSender, userIdReceiver, data.txt, this.socket.room, result, created_date);
                        User.insertMessages(tableM, (result) => {
                            data.id_m = result
                            data.created = created_date
                            //Envoi de mails/notifications
                            notifications.mail(data.user_receiver, data.user_sender, data.type_m)
                            .then((res) =>{
                                data.notif = res
                               this.io.sockets.in(this.socket.room).emit('updatechat', user_receiver, data, context)
                            }).catch((err) => console.log(err));
                            //console.log("ENVOI DU MESSAGE AUDIO AU CALME!")
                            //console.log(result)
                        })
                    })
                }
            }
        }
    }
    sendNotif(res){
        var table = []
        //console.log(res)
        //Insertion de la notification en base de données
        res.time = new Date()
        table.push(res.msg)
        table.push(res.senderAction.id)
        table.push(res.senderAction.nom)
        table.push(res.receiverAction.id)
        table.push(res.receiverAction.nom)
        table.push(res.time)
        //console.log(table)
        User.insert_notification(table, (result, resolve, reject) => {
            //console.log(result)
            if (result > 0){
                resolve(result)
            }else{
                reject(result)
            }
        })
        .then((result) => {
            res.id = result
            //console.log(res)
           this.io.sockets.in(this.socket.room).emit('new_notif', res)
        })
        .catch((err) => console.log(err))
    }
    refreshNotifs(data){
        let table = []
        table.push(data.userId)
        User.get_notifications(table[0], (res, resolve, reject) => {
            if (res.length > 0){
                resolve(res)
            }else{
                reject(new Error("Aucune notification à afficher !"))
            }
        }).then((notifs) => {
            //res.id = result
            //console.log(notifs)
           this.io.sockets.in(this.socket.id).emit('socket_refresh_notifs', notifs)
        }, (err) => {
            //console.log(err)
            this.io.sockets.in(this.socket.id).emit('socket_refresh_notifs', err.message)
        }).catch((err) => {
            this.io.sockets.in(this.socket.id).emit('socket_refresh_notifs', err.message)
        })
    }
    refreshArtPayments(data){
        let table = []
        table.push(data.userId)
        User.get_art_payments(table[0], (res, resolve, reject) => {
            if (res.length > 0){
                resolve(res)
            }else{
                reject(new Error("Aucun payment à afficher !"))
            }
        }).then((payments) => {
            //res.id = result
            // console.log(payments)
            let ref = 0, pay_for_display = []
            payments.forEach((val) => {
                if (ref != val.id_p){
                    pay_for_display.push(val)
                    ref = val.id_p
                }
            });
            // for (var k=0; k < payments.length - 1; k++){
            //     // console.log("payment_len "+payments.length)
            //     if (payments[k].id_p == payments[k+1].id_p){
            //         // console.log("k "+k)
            //         payments.splice(k+1, 1)
            //         // k++;
            //     }
            //     // console.log("ref "+ref)
            // }
            // console.log(payments)
            // console.log(pay_for_display)
            this.io.sockets.in(this.socket.id).emit('socket_refresh_art_payments', pay_for_display)
        }, (err) => {
            //console.log(err)
            this.io.sockets.in(this.socket.id).emit('socket_refresh_art_payments', err.message)
        }).catch((err) => {
            this.io.sockets.in(this.socket.id).emit('socket_refresh_art_payments', err.message)
        })
    }
    update_preview_in_room(data, context){
        for (var k in this.tabCorresp){
            if (this.tabCorresp[k][1] == data.id_r){
                this.tabCorresp[k][6] = data.id_m
                this.tabCorresp[k][7] = data.txt
                if (data.id_r != 1)
                    this.io.sockets.in(data.id_r).emit('updatepreview', this.tabCorresp[k], context)
                else
                    this.socket.emit('updatepreview', this.tabCorresp[k], context)
                break;
            }
        }
    }
    list_msg_from_ind(data, corespObj, type_user, index, filter){
        if (filter){
            this.getPreviousMsgFromInd(15, parseInt(type_user), data, index, (result) => {
                this.list_msg(this.socket, result, corespObj, data, 'previousMsg', 15)
            })
        }else{
            //Ascending (getNextMessage)
            this.getNextMsgFromInd(15, parseInt(type_user), data, index, (result) => {
                this.list_msg(this.socket, result, corespObj, data, 'nextMsg', 15)
            })
        }
    }
    list_msg_from_ind_for_admin(data, corespObj, type_user, index, filter){
        if (filter){
            this.getPreviousMsgFromInd(15, parseInt(type_user), data, index, (result) => {
                this.list_msg(this.socket, result, corespObj, data, 'previousMsg', 15)
            }, corespObj.id_coresp)
        }else{
            //Ascending (getNextMessage)
            this.getNextMsgFromInd(15, parseInt(type_user), data, index, (result) => {
                this.list_msg(this.socket, result, corespObj, data, 'nextMsg', 15)
            }, corespObj.id_coresp)
        }
    }
    list_msg_admin_from_ind(data, corespObj, userId, index, filter){
        if (filter){
            this.getPreviousMsgAdminFromInd(15, parseInt(userId), data, index, (result) => {
                this.list_msg_admin(this.socket, result, corespObj, data, 'previousMsg', 15)
            })
        }else{
            //Ascending (getNextMessage)
            this.getNextMsgAdminFromInd(15, parseInt(userId), data, index, (result) => {
                this.list_msg_admin(this.socket, result, corespObj, data, 'nextMsg', 15)
            })
        }
    }
    switchRoom(idUser, newroom, coresp){
        let data = {}
        if (this.socket.room != newroom){
            this.socket.leave(this.socket.room);
            this.socket.join(newroom);

            data.txt = 'you have connected to '+ newroom
            data.user_sender = "SERVER"
            data.user_receiver = idUser
            data.created = new Date()
            data.id_r = newroom
            this.socket.emit('updatechat', coresp, data);
            // envoyé un message à l'ancienne room
            data.id_r = this.socket.room
            data.txt = idUser+' has left this room'
            this.socket.broadcast.to(this.socket.room).emit('updatechat', coresp, data);
            // update socket session room title
            this.socket.room = newroom
            data.id_r = newroom
            data.txt = idUser+' has joined this room'
            this.socket.broadcast.to(newroom).emit('updatechat', coresp, data);
        }
    }
    update_services(idUser, room, coresp){
        //let data = {}
        User.get_servicesOfPro(coresp.id_coresp, (result) => {
            if (result.length > 0){
                this.socket.emit('updateservicesfront', result);
            }
        })
    }
    update_modeles_devis(idUser){
        //let data = {}
        User.get_devisOfPro(idUser, (result) => {
            if (result.length > 0){
                this.socket.emit('updatemodelesdevisfront', result);
            }
        })
    }
    disconnect(){
        let coresp = {}
        let id_user = this.socket.user !== undefined ?  this.socket.user.userId : 'null';
        coresp.nom = "SERVER";
        coresp.prenom = "SERVER";
        coresp.id_coresp = 1;
        //delete this.userGlobal[this.socket.userId];
        //console.log(socket)
        let data = {}
        // mettre à jour la liste des utilisateurs dans le chat, côté client
        this.io.sockets.emit('updateusers', this.userGlobal);
        // Affiche globalement que le client vient de quitter la room
        data.txt = id_user + ' has disconnected'
        data.user_sender = "SERVER"
        data.user_receiver = id_user
        data.created = new Date()
        this.socket.broadcast.to(this.socket.room).emit('updatechat', coresp, data);
        this.socket.leave(this.socket.room);
        // supprimer le nom d'utilisateur de la liste des noms d'utilisateur globaux
        for( var i=0, len=this.userGlobal.length; i<len; ++i ){
            var c = this.userGlobal[i]
            if(c.id_user == id_user){
                this.userGlobal.splice(i,1);
                break;
            }
        }
    }
}

exports.default = SocketManager