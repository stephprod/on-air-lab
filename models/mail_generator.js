//PROMISE http client
const axios = require('axios');
class MailTemplate{
	static generateClassicHtmlTemplate(events, userInfo, action, typeMessage, website_path, obj){
		let param = {}
		param.events = events
		param.userInfo = userInfo
		param.action = action
		param.typeMessage = typeMessage
		param.website_path = website_path
		param.subject = obj
		param.typeMail = 'classic'
		return axios.get(website_path+"/generateTemplate", {params: param})
		.then((res) => res);
	}
}

module.exports = MailTemplate