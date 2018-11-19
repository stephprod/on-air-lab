const express = require('express')
const User = require('../models/req_user')
const router = express.Router()
const notifications = require("../models/notifications").actions

router.param('id', (req, res, next, token) => {
	req.session.id_u = token
	//console.log(req.session)
	if (req.session.id_u == req.session.id_u_temp){
		User.getUser("id='"+token+"'", (res) => {
			if (res !== undefined && res){
				let obj = {}
				obj.id_coresp = res.id
				obj.nom = res.nom
				obj.prenom = res.prenom
				obj.type = res.type
				obj.pay_module = res.payment_module
				obj.mail = res.email
				req.session.user_receiv = obj
			}
			next()
		})
	}
	else
	{
		res.status(404).send("Not found")
	}
})

router.route('/profile/:id')
	.get((req, res) => {
		let profObj = [], servsObj = [], docsObj = [], tarifObj = [], offrObj = []
        let roomId = null
        let userIdSender = req.session.userId
		let userIdReceiver = req.session.user_receiv.id_coresp
        //console.log(req.session)
        //res.locals.id_u = req.session.id_u
        res.locals.session = req.session
		User.displayProfile(userIdReceiver, (result) => {
			//console.log(result)
			profObj = result
			User.getServicesForDisplay(userIdReceiver, (result2) =>{
				servsObj = result2
				User. getDocumentsForDisplay(userIdReceiver, (result3) =>{
					docsObj = result3
					User.getTarificationForDisplay(userIdReceiver, (result4) => {
						tarifObj = result4
						User.getOffresForDisplay(userIdReceiver, (result5) => {
							//console.log(result5)
							offrObj = result5
							User.roomExist(userIdSender, userIdReceiver, (count) => {
								if (count.length > 0) {
									roomId = count[0].id_room
								}
								res.render('pages/profile2', {profilObj: profObj, servicesObj: servsObj, documentsObj: docsObj, tarificationObj:tarifObj, offObj: offrObj, room: roomId, page: "profil"})
							})
						})
					})
				})
			})
		})
        //console.log("ID du GARS "+req.session.userId)
        //console.log("NOM du GARS "+req.session.userName)
    })
	.post((req, res) => {
		//console.log(req.session.id_u)
		//let created_date = new Date();
		let userSender = {id: req.session.userId, nom: req.session.userName, prenom: req.session.userFirstName, email: req.session.userMail}
		let userReceiver = {id: req.session.user_receiv.id_coresp, nom: req.session.user_receiv.nom, prenom: req.session.user_receiv.prenom, email: req.session.user_receiv.mail}
		//let table = [], tableTemp = [], tableT = [], tableM = []
		// let req_ok = '', req_ko = ''
		let ret = {}
		ret.success = []
		ret.global_msg = []
		ret.msg = 'Demande de contact !'
		ret.created = new Date()
		ret.result = {}
		ret.result.user_sender = userSender.id
		ret.result.type_d = 'contact'
		//console.log(req.session)
		//table.push(userIdSender, userIdReceiver, created_date);
		if (req.session.token == req.headers["x-access-token"]){
			if (req.session.userId === undefined) {
				//console.log("T ES PAS LOG!")
				ret.success.push(false)
				ret.global_msg.push("Connexion requise !")
				res.send(ret)
			}else{
		// 		check_if_room_exist(req, ret).then((result) => {
		// 			return insert_contact_tm(req, result)
		// 		}).then((result) => {
		// 			return insert_message(req, result)
		// 		}).then((result) => {
		// 			return tempo(req, result)
		// 		}).then((result) => {
		// 			notifications.mail(userReceiver, userSender, result.result.type_d)
		// 			.then((result2) => {
		// 				result.notif = result2
		// 				res.send(result)
		// 			})
		// 		}).catch((err) => {
		// 			console.log(err)
		// 			res.send(err)
		// 		})
				check_if_room_exist(req, ret).then((result) => {
					return insert_contact_tm(req, result)
					.then((result) => insert_message(req, result))
					.then((result) => tempo(req, result))
					.then((result) => notifications.mail(userReceiver, userSender, result.result.type_d)
						.then((result2) => {
							result.notif = result2
							res.send(result)
						})
					).catch((err) => {
						console.log(err)
						res.send(err)
					})
				}, (err) => {
					//console.log(err)
					res.send(err)
				})
				.catch((err) => {
					console.log(err)
					res.send(err)
				})
			}
		}else{
			ret.success.push(false)
			ret.global_msg.push("Token compromised !")
			res.send(ret)
		}
})
function check_if_room_exist(req, ret){
	return new Promise ((resolve, reject) =>{
		User.roomExist(req.session.userId, req.session.user_receiv.id_coresp, (count, err) => {
			if (err){
				throw err
			}
			if (count.length > 0) {
				ret.success.push(false)
				ret.global_msg.push("Une room liée à ce professionnel existe déjà, ouvrez le chat pour entrer en communication !")
				ret.result.room = count[0].id_room
				//console.log(ret)
				reject (ret)
			}else{
				resolve(ret)
			}
		})
	})
}
function insert_contact_tm(req, ret){
	let tableT = []
	tableT.push(ret.result.type_d, null, req.session.userId)
	return new Promise((resolve) =>{
		User.insertContactTypeM(tableT, (result)=>{
			if (result > 0){
				ret.success.push(true)
				ret.global_msg.push("Type du message créé !")
				ret.result.id_type_m = result
				resolve(ret)
			}else{
				ret.success.push(false)
				ret.global_msg.push("Une erreur est survenue lors de l'insertion du type de message, contactez le support/modérateur !")
				throw ret;
			}
		})
	})
}
function insert_message(req, ret){
	let tableM = []
	tableM.push(req.session.userId, req.session.user_receiv.id_coresp, ret.msg, 1, ret.result.id_type_m, ret.created)
	return new Promise((resolve) => {
		User.insertMessages(tableM, (result)=>{
			if (result > 0){
				ret.success.push(true)
				ret.global_msg.push("Message inséré !")
				ret.result.id_message = result
				resolve(ret)
			}else{
				ret.success.push(false)
				ret.global_msg.push("Une erreur est survenue lors de l'insertion du message, contactez le support/modérateur !")
				throw ret;
			}
		})
	})
}
function tempo(req, ret){
	let req_ok = [], req_ko = []
	return new Promise((resolve) => {
		req_ok.push('INSERT INTO `rooms` (`userid`, `with_userid`, `cree_le`) VALUES ("'+req.session.userId+'", "'+req.session.user_receiv.id_coresp+'", "'+ret.created.toISOString().split("T")[0]+'")',
			'DELETE FROM `type_message` WHERE `id_type_m`='+ret.result.id_type_m)
		req_ko.push(null, 'DELETE FROM `type_message` WHERE `id_type_m`='+ret.result.id_type_m)
		for (var k in req_ok){
			ret.result.id_t = []
			let tableTemp = []
			tableTemp.push(req_ok[k], req_ko[k], req.session.user_receiv.id_coresp, req.session.userId, ret.result.id_type_m)
			User.insertTemp(tableTemp, (result)=>{
				if (result > 0){
					ret.success.push(true)
					ret.global_msg.push("Temporisation insérée !")
					ret.result.id_t.push(result)
				}else{
					ret.success.push(false)
					ret.global_msg.push("Une erreur est survenue lors de l'insertion de la temporisation, contactez le support/modérateur !")
					throw ret;
				}
				if (k == req_ok.length - 1){
					resolve(ret)
				}
			})
		}
	})
}
module.exports = router;
