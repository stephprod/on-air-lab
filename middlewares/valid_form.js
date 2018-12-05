let express = require('express')
let validator = require('../form_validator')
let session = require('express-session')
let User = require('../models/req_user')

const valid_form = (request, response, next) => {

	let errors = {}
	let err_flag = false;
	let nom = request.body.nom
	let prenom = request.body.prenom
	let email = request.body.email
	let mdp = request.body.password
	let confirm_mdp = request.body.confirm_password
	let type = request.body.type

	if (nom !== undefined && !validator.isName(nom))
	{
		errors.last_name = ["Nom invalide !"]
		err_flag = true;
	}
	if (prenom !== undefined && !validator.isName(prenom))
	{
		errors.first_name = ["Prénom invalide !"]
		err_flag = true
		
	}
	if (email !== undefined && !validator.isEmail(email))
	{
		errors.login = ["Email invalide !"]
		err_flag = true
		
	}
	if (type !== undefined && !validator.isSelected(type))
	{
		errors.type = ["Spécialité invalide !"]
		err_flag = true
	}
	if (mdp !== undefined && !validator.isSafePass(mdp))
    {
    	if (errors.password !== undefined)
        	errors.password.push('Le mot de passe doit contenir au moins 8 caractères avec une lettre et un chiffre !')
    	else
    		errors.password = ['Le mot de passe doit contenir au moins 8 caractères avec une lettre et un chiffre !']
    	err_flag = true
    }
    else
    {
    	if (confirm_mdp !== undefined && !validator.isSamePass(mdp, confirm_mdp))
	    {
	    	if (errors.password !== undefined)
	        	errors.password.push('Le mot de passe et la confirmation du mot de passe doivent être identiques !')
	    	else
	    		errors.password = ['Le mot de passe et la confirmation du mot de passe doivent être identiques !']
	    	if (errors.repeat_password !== undefined)
	        	errors.repeat_password.push('Le mot de passe et la confirmation du mot de passe doivent être identiques !')
	    	else
	    		errors.repeat_password = ['Le mot de passe et la confirmation du mot de passe doivent être identiques !']
	    	
	    	err_flag = true
	    }
    }
    
    if (email !== undefined)
    {
    	//Cas du formulaire d'inscription
		validator.isUnique(email, (result) =>
		{
			if (result)
			{
				if (errors.login !== undefined)
					errors.login.push("Utilisateur déjà inscrit !")
				else
					errors.login = ["Utilisateur déjà inscrit !"]
				err_flag = true
			}
			if (err_flag)
			{
				let ret = {}
				ret.success = []
				ret.global_msg = []
				ret.errors = errors
				ret.global_msg.push("Une erreur est survenue lors du remplissage du formulaire d'inscription !")
				ret.success.push(false)
				response.send(ret)
			}
			else
				next()
		})
	}
	else
	{
		//Cas du formulaire de modification du mot de passe
		validator.isDifferentToPrevious(request.session.token, (res)=>{
			if (validator.isSamePass(mdp, res))
			{
				if (errors.password !== undefined)
	        		errors.password.push('Le nouveau mot de passe doit être différent de l\'ancien !')
	    		else
	    			errors.password = ['Le nouveau mot de passe doit être différent de l\'ancien !']
				err_flag = true
			}
			if (err_flag)
			{
				let ret = {}
				ret.success = []
				ret.global_msg = []
				ret.success.push(false);
				ret.errors = errors
				ret.global_msg.push("Une erreur est survenue lors du remplissage du formulaire d'inscription !")
				response.send(ret)
			}
			else
				next()
		})
	}
}

const url_video_form = (request, response, next) => {
	let errors = {}
	let err_flag = false;
	let url = request.body.url
	if (!validator.isUrlsValid(url))
	{
		errors.video = ["Le lien est invalide !"]
		err_flag = true;
	}
	if (err_flag)
	{
		let ret = {}
		ret.success = []
		ret.global_msg = []
		ret.global_msg.push("Une erreur est survenue lors du remplissage du formulaire d'envoi de video !")
		ret.success.push(false);
		ret.errors = errors
		response.send(ret)
	}
	else
		next()
}

const valid_delete_account_form = (request, response, next)=>{
	let errors = {}
	let err_flag = false
	//Contrôle du formulaire de désinscription à faire
	if (err_flag)
	{
		let ret = {}
		ret.success = []
		ret.global_msg = []
		ret.global_msg.push("Le formulaire de suppression de compte à mal été rempli !")
		ret.success.push(false);
		ret.errors = errors
		response.send(ret)
	}
	else
		next()
}

module.exports = { register_updatePassword: valid_form,
				 module_video: url_video_form,
				 delete_account_form: valid_delete_account_form}