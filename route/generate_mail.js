const express = require('express')
const router = express.Router()

router.route('/generateTemplate')
	.get((req, res) => {
		//console.log(req.query)
		if (req.query !== undefined)
		{	
			let obj = {}
			obj.content = ''
			obj.userInfo = JSON.parse(req.query.userInfo)
			obj.website_path = req.query.website_path
			obj.subject = req.query.subject
			if (req.query.typeMessage == "rdv"){
				if (req.query.action == "accept")
					obj.content = 'Ta demande de rendez-vous a été acceptée !'
				else
					obj.content = 'Ta demande de rendez-vous a été refusée !'
			}else{
				if (req.query.action == "accept")
					obj.content = 'Ta demande de booking a été acceptée !'
				else
					obj.content = 'Ta demande de booking a été refusée !'
			}
			if (req.query.action == "accept"){
				obj.details = 'Dates : '
				for (k in req.query.events){
					//Json parse
					const ev = JSON.parse(req.query.events[k])
					obj.details += 'Début : '+ev.start+ ' Fin : '+ev.end+' / '
				}
			}
			obj.content_end = 'Bien cordialement, '
			if (req.query.typeMail == 'classic'){
				res.render('pages/simple_mail_template', {obj: obj})
			}
			else{
				res.status(404).send("Not found")
			}
		}else
		{
			res.status(404).send("Not found")
		}
     })
	.post((req, res) => {
		//console.log(req.body)
		
})
module.exports = router;