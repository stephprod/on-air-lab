class MailTemplate{
	static generateClassicHtmlTemplate(events, userInfoReceiver, userInfoSender, action, typeMessage, website_path){
		let param = {}
		//console.log(events);
		param.events = events
		param.userInfoReceiv = userInfoReceiver
		param.userInfoSend = userInfoSender
		param.action = action
		param.typeMessage = typeMessage
		param.website_path = website_path
		param.typeMail = 'classic'
		param.content = ''
		if (action != null){
			param.content = '<p style="margin:0px;">'
			switch (typeMessage){
				case "rdv":
					param.content += action == "accept" ? 'Ta demande de rendez-vous a été acceptée par <b>'+userInfoSender.nom+' '+userInfoSender.prenom+'</b> !' : 
						'Ta demande de rendez-vous a été refusée par <b>'+userInfoSender.nom+' '+userInfoSender.prenom+'</b> !'
					param.subject = "Demande de rendez-vous !"
					break;
				case "booking":
					param.content += action == "accept" ? 'Ta demande de booking a été acceptée par <b>'+userInfoSender.nom+' '+userInfoSender.prenom+'</b> !' : 
						'Ta demande de booking a été refusée par <b>'+userInfoSender.nom+' '+userInfoSender.prenom+'</b> !'
					param.subject = "Demande de booking !"
					break;
				default:
					param.subject = "Label-onair : spécialiste de la lise en relation !"
					break;
			}
			param.content += '</p>'
			//console.log(param)
			if (action == "accept") {
				param.content += '<p style="margin:0px;text-align:left;">Dates : </p>';
				for (var k in events) {
					//Json parse
					const ev = events[k];
					param.content += '<p style="margin:0px;"><b>Début :</b> ' + ev.start + ' <b>Fin :</b> ' + ev.end + '</p>';
				}
			} 
		}
		param.content += '<p style="margin:0px;">Bien cordialement, </p>'
		param.content += '<p style="margin:0px;"><b>LabelOnAir</b></p>'
		return param
	}
}

module.exports = MailTemplate