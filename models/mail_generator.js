class MailTemplate{
	static generateClassicHtmlTemplate(events, userInfoReceiver, userInfoSender, action, typeMessage, website_path){
		let param = {}
		let type_receiver_libelle
		switch(userInfoReceiver.type){
			case 1:
				type_receiver_libelle = "Administrateur"
				break;
			case 2:
				type_receiver_libelle = "Professionnel audio"
				break;
			case 3:
				type_receiver_libelle = "Professionnel vidéo"
				break;
			case 4:
				type_receiver_libelle = "Artiste"
				break;
		}
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
					param.subject = action == "accept" ? "Demande de rendez-vous accteptée !" : "Demande de rendez-vous rejetée !"
					break;
				case "booking_response":
					param.content += action == "accept" ? 'Ta demande de booking a été acceptée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !' : 
						'Ta demande de booking a été refusée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = action == "accept" ? "Demande de booking acceptée !" : "Demande de booking rejetée !" 
					break;
				case "devis_response":
					param.content += action == "accept" ? 'Ta demande de devis a été acceptée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !' : 
						'Ta demande de devis a été refusée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = action == "accept" ? "Demande de devis acceptée ! (suite)" : "Demande de devis rejetée ! (suite)"
					break;
				case "payment_response_for_pro":
					param.content += action == "accept" ? 'Ta demande de paiement a été acceptée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !' : 
						'Ta demande de paiement a été refusée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = action == "accept" ? "Demande de paiement acceptée !" : "Demande de paiement rejetée !"
					break;
				case "payment_response_for_art":
					param.content += action == "accept" ? 'Tu as accepté une demande de paiement venant de <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !<br>'+
						'Tu peux l\'annuler à tout moment (avant la date de la première prestation) en accédant au tchat dans la partie \'Mes Réservations\'.<br>'+
						'Vérifies nos conditions d\'annulation de réservation pour connaître la politique de remboursement en cas d\'annulation ou de litiges.<br>' : 
						'Ta as refusé une demande de paiement venant de <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = action == "accept" ? "Demande de paiement acceptée !" : "Demande de paiement rejetée !"
					break;
				case "contact_response":
					param.content += action == "accept" ? 'Ta demande de contact a été acceptée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !<br>'+
						'Accédez au chat se trouvant sur le site pour le/la contacter.' : 
						'Ta demande de contact a été refusée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = action == "accept" ? "Demande de contact acceptée !" : "Demande de contact rejetée !"
					break;
				case "rdv_offer_response":
					param.content += action == "accept" ? 'Ta demande de rendez-vous liée à une offre a été acceptée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !' : 
						'Ta demande de rendez-vous liée à une offre a été refusée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = action == "accept" ? "Demande de rendez-vous liée à une offre acceptée !" : "Demande de rendez-vous liée à une offre rejetée !"
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
					param.subject = "Une action de votre part est requise - Demande de rendez-vous !"
					break;
				case "booking":
					param.content += 'Nouvelle demande de booking envoyée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Une action de votre part est requise - Demande de booking !"	
					break;
				case "devis":
					param.content += 'Nouveau devis envoyée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Une action de votre part est requise - Devis !"
					break;
				case "payment":
					param.content += 'Nouvelle demande de paiement envoyée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Une action de votre part est requise - Demande de paiement !"
					break;
				case "contact":
					param.content += 'Nouvelle demande de contact envoyée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Une action de votre part est requise - Demande de contact !"
					break;
				case "rdv_offer":
					param.content += 'Nouvelle demande de rendez-vous liée à une offre envoyée par <b>'+userInfoSender.prenom+' '+userInfoSender.nom+'</b> !'
					param.subject = "Une action de votre part est requise  - Demande liée à une offre !"
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
				case "forgottenPassword":
					param.content += 'Tu peux suivre le lien suivant pour réinitialiser ton mot de passe : <a href="'+website_path+'"><b>Lien de modification du mot de passe</b></a> !'
					param.subject = "Réinitialisation du mot de passe !"
					break;
				case "register":
					param.content += 'Tu viens de t\'inscrire sur <a href="'+website_path+'"><b>notre site</b></a> sous le statut suivant : ('+type_receiver_libelle+') <br>'+
						'Nous te remercions de l\'intérêt porté à nos services, cependant actuellement ton compte n\'est pas encore vérifié !<br>'+
						'La finalisation de ton inscription se fait en suivant le <a href="'+website_path+'">Lien d\'activation</a>,<br>'+
						'Des utilisateurs t\'attendent, connecte toi au plus vite !'
					param.subject = "Bienvenue dans la communauté 'LabelOnAir' !"
					break;
				case "subscription_deleted":
					param.content += "Tu viens de clôturer ton abonnement à nos services. <br><br>"+
						"Cette action est effective à reception de ce mail. <br>"+
						"Afin de pouvoir continuer à profiter de nos services tu peux à tout moment retourner sur <a href='"+website_path+"'><b>notre site</b></a> et créer un nouvel abonnement.<br><br>"+
						"Des utilisateurs t'attendent, connecte toi au plus vite !<br><br>"
					param.subject = "Résiliation d'abonnement !"
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
	static generateClassicHtmlPaymentTemplate(userInfoReceiver, action, typeMessage, website_path, amount, code){
		let p = {}
		//console.log(events);
		//p.events = events
		p.userInfoReceiv = userInfoReceiver
		//p.userInfoSend = userInfoSender
		p.action = action
		p.typeMessage = typeMessage
		p.website_path = website_path
		p.typeMail = "payment"
		p.content = ""
		if (action != null){
			p.content = "<p>"
			switch (typeMessage){
				case "payment_intent":
					if (code !== ""){
						p.content += action == "accept" ? "Ton paiement de "+amount+" € a été validé !" +
							"<p><b>Lors de ta rencontre avec le professionnel n'oublie pas de lui fournir le code suivant à la fin de la prestation : "+code+"</b></p>" : 
							"Ton paiment de "+amount+" € a été refusé  !"
					}else{
						p.content += action == "accept" ? "Ton paiement de "+amount+" € a été validé ! <br><br>"+
							"Il ne te manque plus qu'à te reconnecter pour profiter de nos services sans restrictions !" : 
							"Ton paiment de "+amount+" € a été refusé  !"
					}
					p.subject = action == "accept" ? "Nouveau paiement accepté !" : "Nouveau paiement rejeté !" 
					break;
				default:
					p.subject = "Label-onair - Nouveau message !"
					break;
			}
			p.content += "</p>"
			//console.log(p)
		}else{
			p.content = "<p>"
			p.content += "</p>"
		}
		p.content += "<p style='margin:0px;'>Bien cordialement, </p>"
		p.content += "<p style='margin:0px;'><b>LabelOnAir</b></p>"
		return p
	}
}

module.exports = MailTemplate