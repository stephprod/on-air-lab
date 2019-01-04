const express = require('express')
const User = require('../models/req_user')
const fs = require('fs')
const router = express.Router()

router.route('/upload-files')
	.get((request, response) => {
		response.locals.session = request.session
		if (request.session.userId == undefined) {
			response.render('pages/index')
		}else{
			User.getInfoPro_etablissement(request.session.userId, (result) => {
				//console.log(result)
				response.render('pages/upload_files', {etabObj: result})
			})
		}
	})
	.post((request, response) => {
		let ret = {}
		ret.success = []
		ret.global_msg = []
		// console.log(request.files)
		// console.log(request.body)
		//console.log(request.file_id)
		if (request.session.token == request.headers["x-access-token"]){
			if(request.files !== undefined){
				if (request.files != null){
					let sampleFile = request.files.uploaded_file
					let originalName = sampleFile.name.split(".")[0].toLowerCase().split(' ').join('')
					//console.log(originalName)
					let filename = originalName+'-'+request.body.file_id+'.'+sampleFile.name.split(".")[1].toLowerCase()
					let table = []
					if (fs.existsSync('public/content/img/'+filename)) {
						//console.log('fichier exist deja');
						ret.global_msg.push("Le fichier existe déjà !")
						ret.success.push(false)
						response.send(ret)
					}else{
						sampleFile.mv('public/content/img/'+filename, function(err) {
							if (err)
								response.send(err)
							else
							{
								table.push(request.body.file_profileId, "image", "/asset/content/img/"+filename)
								User.insert_document(table, (res) => {
									if (res > 0){
										ret.success.push(true)
										ret.global_msg.push("Image(s) envoyée(s) avec succès !")
										ret.path = "/asset/content/img/"+filename
									}
									else
									{
										ret.success.push(false)
										ret.global_msg.push("Une erreur s'est produite lors de l'envoi d'image(s) !")
									}
									response.send(ret)
								})
							}
						})
					}
				}else{
					ret.global_msg.push("Aucune nouvelle(s) image(s) à ajouter !")
					ret.success.push(false)
					response.send(ret)
				}
			}else{
				ret.global_msg.push("Requête invalide !")
				ret.success.push(false)
				response.send(ret)
			}
		}else{
			ret.success.push(false)
			ret.global_msg.push("Session compromise !")
			response.send(ret)
		}
	})
module.exports = router
