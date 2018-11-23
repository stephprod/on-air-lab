//PROMISE http client
const axios = require('axios');
class MailTemplate{
	static generateClassicHtmlTemplate(events, userInfo, action, typeMessage, website_path = 'http://localhost:4000', obj){
		let param = {}
		param.events = events
		param.userInfo = userInfo
		param.action = action
		param.typeMessage = typeMessage
		param.website_path = website_path
		param.subject = obj
		param.typeMail = 'classic'
		return param
	}
}

module.exports = MailTemplate