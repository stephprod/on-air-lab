const express = require('express')
const User = require('../models/req_user')
const router = express.Router()

router.param('id', (req, res, next, token) => {
	req.session.id_u = token
	console.log(req.session)
	if (req.session.id_u == req.session.id_u_temp){
		User.getUser("id='"+token+"'", (res) => {
			if (res !== undefined && res){
				let obj = {}
				obj.id_coresp = res.id
				obj.nom = res.nom
				obj.prenom = res.prenom
				obj.type = res.type
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
		let profilObj = [], servsObj = [], docsObj = [], tarifObj = [], offrObj = []
        let roomId = null
        let userIdSender = req.session.userId
		let userIdReceiver = req.session.user_receiv.id_coresp
        //console.log(req.session)
        //res.locals.id_u = req.session.id_u
        res.locals.session = req.session
		User.displayProfile(userIdReceiver, (result) => {
        	//console.log(result)
        	profilObj = result
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
			        			res.render('pages/profile2', {profilObj: result, servicesObj: servsObj, documentsObj: docsObj, tarificationObj:tarifObj, offObj: offrObj, room: roomId, page: "profil"})
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
		let created_date = new Date();
		let userIdSender = req.session.userId;
		let userIdReceiver = req.session.user_receiv.id_coresp
		let table = [], tableTemp = [], tableT = [], tableM = []
		let req_ok = '', req_ko = ''
		let ret = {}
		ret.success = []
		ret.global_msg = []
		ret.msg = 'Demande de contact !'
		ret.created = created_date
		ret.result = {}
		ret.result.user_sender = userIdSender
		ret.result.type_d = 'contact'
		table.push(userIdSender, userIdReceiver, created_date);
		if (req.session.token == req.headers["x-access-token"]){
			if (userIdSender === undefined) {
				//console.log("T ES PAS LOG!")
				ret.success.push(false)
				ret.global_msg.push("Connexion requise !")
				res.send(ret)
			}else{
				User.roomExist(userIdSender, userIdReceiver, (count) => {
					if (count.length > 0) {
						console.log("room exist deja")
						console.log(count)
						ret.success.push(false)
						ret.global_msg.push("Une room liée à ce professionnel existe déjà, ouvrez le chat pour entrer en communication !")
						ret.result.room = count[0].id_room
						res.send(ret)
					}else{
						req_ok = 'INSERT INTO `rooms` (`userid`, `with_userid`, `cree_le`) VALUES ("'+table[0]+'", "'+table[1]+'", "'+table[2]+'")'
						tableT.push('contact', null, userIdSender)
						User.insertContactTypeM(tableT, (result)=>{
							if (result > 0){
								ret.success.push(true)
								ret.global_msg.push("Type du message créé !")
								tableM.push(userIdSender, userIdReceiver, ret.msg, 1, result, created_date)
								User.insertMessages(tableM, (result2)=>{
									if (result2 > 0){
										ret.success.push(true)
										ret.global_msg.push("Message inséré !")
										ret.result.id_message = result2
										tableTemp.push(req_ok, null, userIdReceiver, userIdSender, result)
										User.insertTemp(tableTemp, (result3)=>{
											if (result3 > 0){
												ret.success.push(true)
												ret.result.id_t = result3
												ret.global_msg.push("Temporisation insérée !")
											}else{
												ret.success.push(false)
												ret.global_msg.push("Une erreur est survenue lors de l'insertion de la temporisation, contactez le support/modérateur !")
											}
											res.send(ret)
										})
									}else{
										ret.success.push(false)
										ret.global_msg.push("Une erreur est survenue lors de l'insertion du message, contactez le support/modérateur !")
										res.send(ret)
									}
								})
							}else{
								ret.success.push(false)
								ret.global_msg.push("Une erreur est survenue lors de l'insertion du type de message, contactez le support/modérateur !")
								res.send(ret)
							}
						})
					}
				})
			}
		}else{
			ret.success.push(false)
			ret.global_msg.push("Token compromised !")
			res.send(ret)
		}
})
module.exports = router;
