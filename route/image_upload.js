*-*let express = require('express')
let User = require('../models/req_user')
//let fileUpload = require('express-fileupload')
let router = express.Router()

//router.use(fileUpload())

router.route('/upload_image')
	.get((request, response) => {

	})
	.post((request, response) => {
		console.log(request.files)
		let table = []
		let serv = []
		/*table.push(request.session.userId)
		for (let prop in request.body){
			table.push(request.body[prop])
		}
		console.log(table)*/
		let sampleFile = request.files.uploaded_file
		// Use the mv() method to place the file somewhere on your server
		let ret = {}
		ret.success = []
		ret.global_msg = []
		let filename = 'avatar-'+request.session.userId+'.'+sampleFile.name.split(".")[1]
		sampleFile.mv('public/content/img/'+filename, function(err) {
			if (err){
				ret.success.push(false)
				ret.errors = {}
				ret.errors.upload_image = ["Veuillez sélectionner une image valide !"]
				ret.global_msg.push("L'upload de l'image a échoué !")
				response.send(ret)
			}
			else
			{
				User.update_etablissement("path_img='/asset/content/img/"+filename+"' WHERE `profil`.`id_user`="+request.session.userId, (res) => {
					if (res > 0){
						ret.success.push(true)
						ret.global_msg.push("Image modifiée avec succès !")
					}
					else
					{
						ret.success.push(false)
						ret.global_msg.push("Echec lors de la modification de l'image !")
					}
					response.send(ret)
				})
			}
		})
})
module.exports = router