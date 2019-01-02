const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
//const db = require('./db_start_engine')
//const sass = require('node-sass')
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
const abo_payment = require('./route/historique_payment')
const mail_template_generator = require('./route/generate_mail')
const pay_webhook = require('./route/payment_webhook')
const pay_module_pro = require('./route/payment_pro_module')
const pay_intent = require('./route/payment_intent')
const plan3dsecure = require('./route/plan3dsecure')
const validRegister = require('./route/valid_register')
const get_paid = require('./route/get_payment')
const delete_plan = require('./route/delete_plan')
//const loginFast = require('./route/login_fast')
/*Modeles*/
const notifications = require('./models/notifications').actions
const socket_manage = require('./models/socket_manager').default
// const random_code_gen = require('./models/code_gen').default
// SECURE HTTP POUR SOCKET IO
const http = require('http').Server(app)
const io = require('socket.io')(http)
//PROMISE http client
const axios = require('axios');
//NOTRE MOTEUR DE TEMPLATE
app.set('view engine', 'ejs')


//NOS MIDDLEWARES
var __dirname
app.use('/asset', express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: false }))
//app.use(bodyParser.json())

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
app.use('/', abo_payment)
app.use('/', w_search)
app.use('/', devis_request)
app.use('/', logout)
app.use('/', delete_account)
app.use('/', module_actions)
app.use('/', payment_recap)
app.use('/', mailer)
app.use('/', payment)
app.use('/', mail_template_generator)
app.use('/', pay_webhook)
app.use('/', pay_module_pro)
app.use('/', pay_intent)
app.use('/', plan3dsecure)
app.use('/', validRegister)
//app.use('/', loginFast)
app.use('/', get_paid)
app.use('/', delete_plan)
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
// console.log("converting string : ")
// random_code_gen.obj.convertBase("1175445-08111808", random_code_gen.base12, random_code_gen.base54)
// .then((res) => {
//     console.log(res)
//     return random_code_gen.obj.convertBase(res, random_code_gen.base54, random_code_gen.base12) 
// })
// .then((res2) => console.log(res2))
// .catch((err => console.log(err)))
let userGlobal = []
// EMESSION DE SOCKET
io.sockets.on('connection', function (socket) {
    let socketManage = new socket_manage(io, socket, userGlobal)
    socket.on('sendNotif', (res) => {
        socketManage.sendNotif(res)
    })
    socket.on('refresh_notifs', (data) => {
        socketManage.refreshNotifs(data)
    })
    socket.on('refresh_art_payments', (data) => {
        socketManage.refreshArtPayments(data)
    })
    // QUAND LE USER SE CO DANS LOGIN ET ARRIVE SUR LA PAGE DU CHAT
    socket.on('adduser', function(id, type){
        socketManage.add_user(id, type)
    });
    // quand le client émet 'sendchat', cela écoute et exécute
    socket.on('sendchat', function (data, userId, user_receiver, context) {
        socketManage.send_chat(data, userId, user_receiver, context)
    });
    socket.on('update_preview_in_room',  (data, context) =>{
        socketManage.update_preview_in_room(data, context)
    });
    socket.on("list_msg_from_ind", (data, corespObj, type_user, index, filter) => {
        socketManage.list_msg_from_ind(data, corespObj, type_user, index, filter)
    })
    socket.on("list_msg_admin_from_ind", (data, corespObj, userId, index, filter) => {
        socketManage.list_msg_admin_from_ind(data, corespObj, userId, index, filter)
    })
    socket.on('list_msg', (data, corespObj, type_user) => {
        socketManage.list_latest_msg(data, corespObj, type_user)
    });
    socket.on('list_msg_for_admin', (data, corespObj, type_user) => {
        socketManage.list_latest_msg_for_admin(data, corespObj, type_user)
    });
    socket.on("list_msg_from_ind_for_admin", (data, corespObj, type_user, index, filter) => {
        socketManage.list_msg_from_ind_for_admin(data, corespObj, type_user, index, filter)
    })
    socket.on('list_msg_admin', (data, corespObj, userId) => {
        socketManage.list_latest_msg_admin(data, corespObj, userId)
    });

    socket.on('switchRoom', function(idUser, newroom, coresp){
        socketManage.switchRoom(idUser, newroom, coresp)
    });

    socket.on('update_services', function(idUser, room, coresp){
        socketManage.update_services(idUser, room, coresp)
    });

    socket.on('update_modeles_devis', function(idUser){
        socketManage.update_modeles_devis(idUser)
    });

    // lorsque l'utilisateur se déconnecte
    socket.on('disconnect', function(){
        socketManage.disconnect()
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
    server: http,
    notifs: notifications
}