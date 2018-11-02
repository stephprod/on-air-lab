const express = require('express')
const User = require('../models/req_user')
const validator = require('../middlewares/valid_form2').audio_file
const router = express.Router()
const fileUpload = require('express-fileupload')

router.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }
}))

router.route('/song_upload')
	.post(validator, (request, response) => {
		//console.log(request.files)
		//console.log(request.body)
		//Use the mv() method to place the file somewhere on your server
		let ret = {}
		ret.success = []
		ret.global_msg = []
		if (request.session.token == request.headers["x-access-token"]){
			let sampleFile = request.files.uploaded_file
			sampleFile.mv('public/content/audio/filename.mp3', function(err) {
				if (err){
					ret.errors = err
					ret.success.push(false)
					ret.global_msg.push("Une erreur est survenue lors de l'upload du fichier, contactez le support/modérateur !")
				}
				else
				{
					ret.result = {}
					ret.result.type_a = "audio"
					ret.result.path = "/asset/content/audio/filename.mp3"
					ret.msg = request.body.msg != "" ? request.body.msg : "Aucun objet !"
					ret.global_msg.push('Audio envoyé')
					ret.success.push(true)
				}
				response.send(ret)
			})
		}else{
			ret.success.push(false)
			ret.global_msg.push("Token compromised !")
			response.send(ret)
		}
	})
module.exports = router
