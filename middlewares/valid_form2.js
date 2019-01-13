//let express = require('express')
let validator = require('../form_validator')
// let session = require('express-session')
// let User = require('../models/req_user')

let valid_login_form = (request, response, next) => {

	let errors = {}
	let err_flag = false;
	let email = request.body.email
	let mdp = request.body.pass

	if (!validator.isEmail(email))
	{
		errors.login = ["Email invalide !"]
		err_flag = true;
		
	}
	if (!validator.isSafePass(mdp))
	{
		errors.password = ["Mot de passe invalide !"]
		err_flag = true;
	}
	if (err_flag)
	{
		let ret = {}
		ret.global_msg = []
		ret.success = []
		ret.errors = errors
		ret.success.push(false)
		ret.global_msg.push("Une erreur est survenue lors de la connexion !")
		response.send(ret)
	}
	else
		next()
}

let valid_forgottenPassword_form = (request, response, next) => {

	let errors = {}
	let err_flag = false;
	let email = request.body.email
	
	if (!validator.isEmail(email))
	{
		errors.login = ["Email invalide !"]
		err_flag = true;
		
	}
	if (err_flag)
	{	
		let ret = {}
		ret.success = []
		ret.global_msg = []
		ret.success.push(false);
		ret.global_msg.push("Une erreur est survenue lors du remplissage du formulaire !")
		ret.errors = errors;
		response.send(ret)
	}
	else
		next()
	
}

let valid_audio_file = (request, response, next) => {
	console.log(request.files)
	let errors = {}
	let err_flag = false;
	let file = request.files.uploaded_file
	
	if (!validator.isCorrectAudioFile(file))
	{
		errors.song = ["Audio invalide !"]
		err_flag = true;
		
	}
	if (err_flag)
	{	
		let ret = {}
		ret.success = []
		ret.global_msg = []
		ret.success.push(false);
		ret.global_msg.push("Une erreur est survenue dans le formulaire d'upload d'une musique !")
		ret.errors = errors;
		response.send(ret)
	}
	else
		next()
	
}

let profile_valid_form = (request, response, next) => {
	let errors = {}
	let err_flag = false;
	let nom = request.body.nom,
	adresse = request.body.adresse,
	cp = request.body.cp,
	descr = request.body.descr,
	siret = request.body.siret,
	siren = request.body.siren,
	date_birth = request.body.date_birth
	if (request.body.cible == "etab"){
		if (!validator.notEmpty(nom))
		{
			errors.nom = ["Nom invalide !"]
			err_flag = true;
			
		}
		if (!validator.notEmpty(adresse))
		{
			errors.adresse = ["Adresse invalide !"]
			err_flag = true;
			
		}
		if (!validator.isNum(cp))
		{
			errors.cp = ["Code postal invalide !"]
			err_flag = true;
			
		}
		if (!validator.notEmpty(descr))
		{
			errors.descr = ["Description invalide !"]
			err_flag = true;
			
		}
		if (!validator.isNum(siret))
		{
			errors.siret = ["SIRET invalide !"]
			err_flag = true;
			
		}
		if (!validator.isNum(siren))
		{
			errors.siren = ["SIREN invalide !"]
			err_flag = true;
			
		}
		if (!validator.isInputDate(date_birth))
		{
			errors.date_birth = ["Date invalide !"]
			err_flag = true;
		}
		else{
			if (!validator.isLegalAgeDob(date_birth)){
				errors.date_birth = ["Vous devez avoir au moins 13ans pour utiliser nos services !"]
				err_flag = true;
			}
		}
	}
	if (err_flag)
	{	
		let ret = {}
		ret.success = []
		ret.global_msg = []
		ret.global_msg.push("Le formulaire du profil a mal été rempli, ciblez les champs du formulaire pour voir ce qui n'a pas fonctionné !")
		ret.success.push(false)
		ret.errors = errors
		response.send(ret)
	}
	else
		next()
	
}

let offer_valid_form = (request, response, next) =>{
	let errors = {}
	let err_flag = false;
	let title = request.body.title,
	spe_off = request.body.spe_off,
	prix_off = request.body.prix_off
	//id_profil = request.body.id_profil

	if (request.body.action == "insert_update"){
		if (!validator.notEmpty(title))
		{
			errors.title = ["Titre invalide !"]
			err_flag = true;
			
		}
		if (!validator.notEmpty(spe_off))
		{
			errors.spe_off = ["Détails de l'offre invalides !"]
			err_flag = true;
			
		}
		if (!validator.isNum(prix_off))
		{
			errors.prix_off = ["Prix invalide !"]
			err_flag = true;
			
		}
		/*if (!validator.isNum(id_profil))
		{
			errors.id_profil = ["Description invalide !"]
			err_flag = true;
			
		}*/
	}
	if (err_flag)
	{	
		let ret = {}
		ret.success = []
		ret.global_msg = []
		ret.global_msg.push("Le formulaire de l'offre a mal été rempli, ciblez les champs du formulaire pour voir ce qui n'a pas fonctionné !")
		ret.success.push(false)
		ret.errors = errors
		response.send(ret)
	}
	else
		next()
}

module.exports = {login: valid_login_form,
				forgottenPassword: valid_forgottenPassword_form,
				audio_file: valid_audio_file,
				valid_profile: profile_valid_form,
				valid_offre: offer_valid_form}