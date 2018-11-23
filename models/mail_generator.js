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
			param.content = '<p>'
			switch (typeMessage){
				case "rdv_response":
					param.content += action == "accept" ? 'Ta demande de rendez-vous a été acceptée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !' : 
						'Ta demande de rendez-vous a été refusée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Demande de rendez-vous !"
					break;
				case "booking_response":
					param.content += action == "accept" ? 'Ta demande de booking a été acceptée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !' : 
						'Ta demande de booking a été refusée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Demande de booking !"
					break;
				case "devis_response":
					param.content += action == "accept" ? 'Ta demande de devis a été acceptée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !' : 
						'Ta demande de devis a été refusée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Demande de devis ! (suite)"
					break;
				case "payment_response":
					param.content += action == "accept" ? 'Ta demande de paiement a été acceptée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !' : 
						'Ta demande de paiement a été refusée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Demande de paiement !"
					break;
				case "contact_response":
					param.content += action == "accept" ? 'Ta demande de contact a été acceptée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !<br>'+
						'Accédez au chat se trouvant sur le site pour le/la contacter.' : 
						'Ta demande de contact a été refusée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Demande de contact !"
					break;
				case "rdv_offer_response":
					param.content += action == "accept" ? 'Ta demande de rendez-vous liée à une offre a été acceptée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !' : 
						'Ta demande de rendez-vous liée à une offre a été refusée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Demande de rendez-vous liée à une offre !"
					break;
				default:
					param.subject = "Label-onair - Nouveau message !"
					break;
			}
			param.content += '</p>'
			//console.log(param)
			if (events != null && events.length > 0) {
				param.content += '<p style="margin:0px;text-align:left;">Dates : </p>';
				for (var k in events) {
					//Json parse
					const ev = events[k];
					param.content += '<p style="margin:0px;"><b>Début :</b> ' + ev.start + ' <b>Fin :</b> ' + ev.end + '</p>';
				}
			} 
		}else{
			param.content = '<p style="margin:0px;">'
			switch (typeMessage){
				case "rdv":
					param.content += 'Nouvelle demande de rendez-vous envoyée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Une action de votre part est requise !"
					break;
				case "booking":
					param.content += 'Nouvelle demande de booking envoyée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Une action de votre part est requise !"	
					break;
				case "devis":
					param.content += 'Nouveau devis envoyée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Une action de votre part est requise !"
					break;
				case "payment":
					param.content += 'Nouvelle demande de paiement envoyée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Une action de votre part est requise !"
					break;
				case "contact":
					param.content += 'Nouvelle demande de contact envoyée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Une action de votre part est requise !"
					break;
				case "rdv_offer":
					param.content += 'Nouvelle demande de rendez-vous liée à une offre envoyée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Une action de votre part est requise !"
					break;
				case "devis_request":
					param.content += 'Nouvelle demande de devis envoyée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Demande de devis !"
					break;
				case "audio":
					param.content += 'Tu as reçu un nouveau fichier audio de la part de <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Envoi de fichier audio !"
					break;
				case "video":
					param.content += 'Tu as reçu une nouvelle vidéo de la part de <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Envoi de vidéo !"
					break;
				default:
					param.content += 'Tu as reçu un nouveau message de la part de <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Label-onair - Nouveau message !"
					break;
			}
			param.content += '</p>'
			if (events != null && events.length > 0) {
				param.content += '<p style="margin:0px;text-align:left;">Dates : </p>';
				for (k in events) {
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
	static generateClassicHtmlPaymentTemplate(userInfoReceiver, action, typeMessage, website_path, amount){
		let p = {}
		//console.log(events);
		//p.events = events
		p.userInfoReceiv = userInfoReceiver
		//p.userInfoSend = userInfoSender
		p.action = action
		p.typeMessage = typeMessage
		p.website_path = website_path
		p.typeMail = 'payment'
		p.content = ''
		if (action != null){
			p.content = '<p>'
			switch (typeMessage){
				case "payment_intent":
					p.content += action == "accept" ? 'Ton paiement de '+amount+' € a été validé !' : 
					'Ton paiment de '+amount+' € a été refusé  !'
					p.subject = "Nouveau paiement !"
					break;
				default:
					p.subject = "Label-onair - Nouveau message !"
					break;
			}
			p.content += '</p>'
			//console.log(p)
		}else{
			p.content = '<p>'
			p.content += '</p>'
		}
		p.content += '<p style="margin:0px;">Bien cordialement, </p>'
		p.content += '<p style="margin:0px;"><b>LabelOnAir</b></p>'
		return p
	}
}

module.exports = MailTemplate