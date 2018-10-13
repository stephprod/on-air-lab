*-*let express = require('express')
let User = require('../models/req_user')
//let fileUpload = require('express-fileupload')
let router = express.Router()

router.route('/upload-files')
	.get((request, response) => {
		//DEBUG
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
		//console.log(request.files)
		//console.log(request.body)
		let sampleFile = request.files.uploaded_file
		// Use the mv() method to place the file somewhere on your server
		let ret = {}
		let filename = 'avatar-'+request.body.file_profileId+'-'+request.body.file_id+'.'+sampleFile.name.split(".")[1]
		let table = []
		sampleFile.mv('public/content/img/'+filename, function(err) {
			if (err)
				response.send(err)
			else
			{
				table.push(request.body.file_profileId, "image", "/asset/content/img/"+filename)
				User.insert_document(table, (res) => {
					if (res > 0){
						ret.success = true
					}
					else
					{
						ret.success = false
					}
					response.send(ret)
				})
			}
		})
	})
module.exports = router