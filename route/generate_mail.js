const express = require('express')
const router = express.Router()

router.route('/generateMail')
	.get((req, res) => {
		//console.log(req.query)
		if (req.query !== undefined)
		{	
			let obj = {}
			obj.userInfo = JSON.parse(req.query.userInfoReceiv)
			obj.website_path = req.query.website_path
			obj.subject = req.query.subject
			obj.content = req.query.content
			//console.log(obj)
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
