import {update_front_with_msg, update_front_with_errors} from './front-update.js';
var off_valid_link = $("a[data-action='offre']");
off_valid_link.on("click", on_offer_valid_link_click);
var tarif_valid_link = $("a[data-action='tarif']");
tarif_valid_link.on("click", on_tarif_valid_link_click);
var agent_photo = $( "#agent-photo" );
agent_photo.on("change", on_agent_photo_change);
var select_cities = $("select[name='cp']");
var select_dpt = $("select[name='dept']");
var serv_valid_link = $("a[data-action='services']");
serv_valid_link.on("click", on_serv_valid_link_click);
var sliders_tarification = $("div[id^='slider-t-']");
var etab_valid_link = $("a[data-action='etablissement']");
var off_delete_div = $("div.delete-off");
var code_payment_check_link = $("a[data-action='get-payment']");
var session = JSON.parse(sessionStorage.getItem('session'));
//sessionStorage.clear();
var user = null;
//var userId = null;
var token = null;
var business= JSON.parse(sessionStorage.getItem('business'));
var price = 1999;
code_payment_check_link.on("click", on_code_payment_check_link_click);
etab_valid_link.on("click", on_etab_valid_link_click);
off_delete_div.on("click", on_off_delete_div_click);
$(sliders_tarification[0]).slider({});
$(sliders_tarification[1]).slider({});
$(sliders_tarification[2]).slider({});
$(sliders_tarification[0]).slider("disable");
$(sliders_tarification[1]).on("slidechange", on_tarif_slider_change);
$(sliders_tarification[2]).on("slidechange", on_tarif_slider_change);
$(document).on("ready", function(){
	var extra_datas = JSON.parse(localStorage.getItem("datas_infoPro"));
	localStorage.clear();
	$("input[name^='cc']").removeAttr("disabled");
	if (extra_datas != null){
		//console.log(extra_datas);
		update_front_with_msg(extra_datas, "msg-profile");
		if (!extra_datas.success[0])
			update_front_with_errors(extra_datas.errors);
		else
			$("input[name^='cc']").removeAttr("disabled");
	}
});
$("form[name='agent-form'] [name='email']").attr("disabled", "disabled");
if (session != null && session.user != undefined){
	user = session.user;
	//userId = user.id;
	token = session.token;
}
$(".slider[id^=slider-o-price]").each( function() {
	var sliderId = $( this ).attr('id');
	$( this ).slider({
			range: "min",
			min:  parseFloat($( this ).attr("data-min")),
			max: parseFloat($( this ).attr("data-max")),
			value: parseFloat($( this ).attr("data-val")),
			step: 0.1,
			slide: function( event, ui ) {
			$( "#" + sliderId + "-value" ).val( ui.value );
			}
	});
	$( "#" + sliderId + "-value" ).val( $( this ).slider( "value" ) );
});
if(business != null){
	var date_ob = new Date(business.dateOfBirth);
	// var now = new Date();
	// console.log(now - date_ob);
	var date_string = date_ob.getUTCFullYear().toString(10) + "-" +
		(date_ob.getUTCMonth() + 1).toString(10).padStart(2, '0') + "-" +
		date_ob.getUTCDate().toString(10).padStart(2, '0');
	// console.log(date_ob);
	// console.log(business);
	$("form[name='agent-form'] [name='date_birth']").val(date_string);
	$.ajax({
		type: "POST",
		url: "/get_all_cp",
		success: function (data){
			let business_dpt_in_5_digits = business.dpt.padStart(5, '0');
			//console.log(data);
			$.each(data.cp, function(key, value) {
				select_dpt.append("<option value='"+value.ville_departement+"'>"+value.ville_departement+"</option>");
			});
			//console.log(business.dpt);
			select_dpt.selectpicker('refresh');
			select_dpt.val(business_dpt_in_5_digits.substring(0, 2));
			select_dpt.selectpicker('render');
			var d = {}
			d.code_p = business_dpt_in_5_digits.substring(0, 2);
			//console.log(datas);
			$.ajax({
				type : "POST",
				url : "/get_cities_in_cp",
				data:  d,
				success: function(data) {
					//AFFICHER LES VILLES ISSUS DE LA BASE DE DONNEES
					//console.log(select_cp);
					select_cities.empty();
					$.each(data.cities, function(key, value) {
						select_cities.append("<option data-city='"+value.ville_nom+"' data-long='"+value.ville_longitude_deg+"' data-lat='"+value.ville_latitude_deg+"' value='"+value.ville_id+"'>"+value.ville_nom+" / "+value.ville_code_postal+"</option>");
					});
					select_cities.selectpicker('refresh');
					select_cities.val(business.ville_id);
					select_cities.selectpicker('render');
				}   
			});
		}
	});
}else{
	$.ajax({
		type: "POST",
		url: "/get_all_cp",
		success: function (data){
			//console.log(data);
			$.each(data.cp, function(key, value) {
				select_dpt.append("<option value='"+value.ville_departement+"'>"+value.ville_departement+"</option>");
			});
			select_dpt.selectpicker('refresh');
		}
	});
}
$(select_dpt[0]).on("changed.bs.select", cp_change_action);
function on_offer_valid_link_click(event){
	event.preventDefault();
	//console.log($(event.target).parents("a[data-action='offre']"));
	var link = $(event.target).parents("a[data-action='offre']");
	var datas = {};
	//console.log(link);
	var div = $("div#"+link.data("form"));
	datas.idO = parseInt(link.data("form").split("-")[2]);
	datas.title = div.find("input[name='title']").val();
	datas.spe_off = div.find("textarea[name='spe_off']").val();
	datas.prix_off = div.find("div[id^='slider-o-price']").slider("value");
	datas.id_profil = div.data("profil");
	datas.action = "insert_update";
	//console.log(datas);	
	//console.log('click for '+$(link).data("action"));
	$.ajax({
		type: div.attr("method"),
		url: "/create_off",
		data: datas,
		beforeSend: function(req){
			req.setRequestHeader("x-access-token", token);
		},
		success: function(data){
			//console.log(data);
			//localStorage.setItem("datas", JSON.stringify(data));
			//document.location = "/info-pro";
			if (!data.success[0]){
				update_front_with_msg(data, "msg-tab");
				update_front_with_errors(data.errors);
			}else{
				localStorage.setItem("datas_infoPro", JSON.stringify(data));
				document.location = "/info-pro";
			}
		}
	});
}
function on_agent_photo_change(){
	var formData = new FormData();
	// Choix de l'utilisateur à partir d'un input HTML de type file...
	formData.append("uploaded_file", this.files[0], this.files[0].name);
	//console.log(this.files[0]);
	//console.log(formData);
	$.ajax({
		type: "POST",
		url: "/upload_image",
		data: formData,
		beforeSend: function (req){
			req.setRequestHeader("x-access-token", token);
		},
		processData: false,  // indique à jQuery de ne pas traiter les données
		contentType: false,  // indique à jQuery de ne pas configurer le contentType
		success: function(data){
			//console.log(data);
			if (data.success[0]){
				localStorage.setItem("datas_infoPro", JSON.stringify(data));
				document.location = "/info-pro";
			}else{
				update_front_with_msg(data, "msg-profile");
				update_front_with_errors(data.errors);
			}
		}
	});
}
function cp_change_action(e){
	var d = {}
	d.code_p = $(e.target).val();
	//console.log(datas);
	$.ajax({
		type : "POST",
		url : "/get_cities_in_cp",
		data:  d,
		success: function(data) {
			//AFFICHER LES VILLES ISSUS DE LA BASE DE DONNEES
			//console.log(select_cp);
			select_cities.empty();
			$.each(data.cities, function(key, value) {
				select_cities.append("<option data-city='"+value.ville_nom+"' data-long='"+value.ville_longitude_deg+"' data-lat='"+value.ville_latitude_deg+"' value='"+value.ville_id+"'>"+value.ville_nom+" / "+value.ville_code_postal+"</option>");
				//$(select_cities[1]).append("<option data-city='"+value.ville_nom+"' data-long='"+value.ville_longitude_deg+"' data-lat='"+value.ville_latitude_deg+"' value='"+value.ville_id+"'>"+value.ville_nom+" - "+value.ville_code_postal+"</option>");
			});
			select_cities.selectpicker('refresh');
		}   
	});
}
function on_serv_valid_link_click(e){
	e.preventDefault();
	var datas = {};
	var servicesChecked = $("input[name^='cc']:checked");
	datas.cible = "services";
	datas.services = [];
	//console.log(servicesChecked);
	$.each(servicesChecked, function (index, value){
		datas.services.push(parseInt($(value).attr("id")));
	});
	//console.log(datas);
	$.ajax({
		type: "POST",
		url: "/info-pro",
		data: datas,
		beforeSend: function (req){
			req.setRequestHeader("x-access-token", token);
		},
		success: function (data){
			//localStorage.setItem("datas", JSON.stringify(data));
			//document.location = "/info-pro";
			update_front_with_msg(data, "msg-service");
			if (!data.success[0])
				update_front_with_errors(data.errors);
		}
	})
}
function on_tarif_slider_change(){
	var newVal = $(sliders_tarification[1]).slider("value") * $(sliders_tarification[2]).slider("value")
	var sliderId = $(sliders_tarification[0]).attr("id");
	$(sliders_tarification[0]).slider("value", newVal);
	$( "#" + sliderId + "-value" ).val( newVal );
}
function on_tarif_valid_link_click(event){
	event.preventDefault();
	var link = $(event.target).parents("a[data-action='tarif']");
	if (link.length == 0)
		link = $(event.target);
	var datas = {};
	//var div = $("div#"+$(link[0]).data("form"));
	//console.log($(event.target).parents("a"));
	datas.prix_min = $(sliders_tarification[0]).slider("value");
	datas.prix_h = $(sliders_tarification[1]).slider("value");
	datas.nbr_h_min = $(sliders_tarification[2]).slider("value");
	//datas.id_profil = div.data("profil");
	//console.log(datas);
	$.ajax({
		type: "POST",
		url: "/tarification",
		data: datas,
		beforeSend: function (req){
			req.setRequestHeader("x-access-token", token);
		},
		success: function (data){
			update_front_with_msg(data, "msg-tab");
			if (!data.success[0]){
				update_front_with_errors(data.errors);
			}
			// else{
			// 	localStorage.setItem("datas_infoPro", JSON.stringify(data));
			// 	document.location = "/info-pro";
			// }
		}
	});
}
function on_code_payment_check_link_click(e){
	e.preventDefault();
	var parent = $(e.target).parents("#get-payment-form");
	var link = parent.find("a[data-action='get-payment']");
	var input = parent.find("input#code-payment");
	if (link.length == 0)
		link = $(e.target);
	var datas = {};
	//var div = $("div#"+$(link[0]).data("form"));
	//console.log($(event.target).parents("a"));
	datas.code = input.val();
	datas.profil = parent.data("profil");
	//datas.id_profil = div.data("profil");
	//console.log(datas);
	$.ajax({
		type: "POST",
		url: "/get-payment",
		data: datas,
		beforeSend: function (req){
			req.setRequestHeader("x-access-token", token);
		},
		async: false,
		success: function (data){
			update_front_with_msg(data, "msg-tab");
			// if (!data.success[0])
			// 	update_front_with_errors(data.errors);
			// else
			// 	document.location = "/info-pro";
			//console.log(data);
		}
	});
}
function on_etab_valid_link_click(e){
	var datas = {};
	e.preventDefault();
	var form = $("form[name='agent-form']");
	var nom, adresse, cp, ville_id, description, siret, date_birth, siren;
	datas.cible = "etab";
	nom = form.find("[name='nom']").val();
	adresse = form.find("[name='adresse']").val();
	cp = parseInt(form.find("[name='cp'] option:selected").text().split("/")[1]);
	ville_id = parseInt(form.find("[name='cp']").val());
	description = form.find("[name='descr']").val();
	siret = form.find("[name='siret']").val();
	siren = form.find("[name='siren']").val();
	date_birth = form.find("[name='date_birth']").val();
	datas.nom = nom;
	datas.adresse = adresse;
	datas.cp = cp.toString(10).padStart(5, "0");
	datas.ville_id = ville_id;
	datas.descr = description;
	datas.siret = siret;
	datas.date_birth = date_birth
	datas.siren = siren;
	//console.log(date_creat);
	//console.log(datas);
	$.ajax({
		type: "POST",
		url: "/info-pro",
		data: datas,
		beforeSend: function (req){
			req.setRequestHeader("x-access-token", token);
		},
		success: function (data){
			//console.log(data)
			if (data.success[0]){
				localStorage.setItem("datas_infoPro", JSON.stringify(data));
				document.location = "/info-pro";
			}else{
				update_front_with_msg(data, "msg-profile");
				update_front_with_errors(data.errors);
			}
		}
	});
}
function on_off_delete_div_click(e){
	e.preventDefault();
	//console.log("click on delete offre !");
	var datas = {};
	// var that = $(this);
	// var parentRow = $("div#home > div.row");
	datas.action = "delete";
	datas.id_offre = $(this).data("id-offre");
	// console.log(datas);
	// console.log($(this));
	$.ajax({
		type: "POST",
		url: "/create_off",
		data: datas,
		beforeSend: function (req){
			req.setRequestHeader("x-access-token", token);
		},
		success: function (data){
			//update_front_with_msg(data, "msg-tab");
			//console.log(that.parents(".grid-offer-col"));
			if (data.success[0]){
				localStorage.setItem("datas_infoPro", JSON.stringify(data));
				document.location = "/info-pro";
			}else{
				update_front_with_msg(data, "msg-tab");
				update_front_with_errors(data.errors);
			}
			//console.log(data);
		}
	});
}
$(document).on("change", "#profile input[id^=slider-t-price-h], #profile input[id^=slider-t-h]"
	, function(){
		var sliderId = $(this).attr("id").replace("-value", "");
	var slider = $(this).parents("#profile").find("div#"+sliderId).slider();
	var newNumber = parseFloat($(this).val());
	//console.log("input change !"+newNumber);
	if (isNaN(newNumber)){
		slider.slider("value", 0);
	}
	else{
		slider.slider("value", newNumber);
	}

});

$(document).on("change", "input[id^=slider-o-price]", function(){
	var slider = $(this).parents(".grid-offer-back").find("div[id^=slider-o-price]").slider();
	var newNumber = parseFloat($(this).val());
	if (isNaN(newNumber)){
		slider.slider("value", 0);
	}
	else{
		slider.slider("value", newNumber);
	}
});
$(document).on('click', '#redirectAdmin', function(event) {
	event.preventDefault();
	//$("#switcher-button2").trigger('click');
	$($('iframe[src="/chat"]')[0].contentDocument).find("#friends").trigger('click');
	$($('iframe[src="/chat"]')[0].contentDocument).find(".friend:nth-child(1)").trigger('click');
});
$(document).on('click', '#customButton', function(e) {
	e.preventDefault();
	if ($("#customButton").data("action") == "create")
		if (business != null)
			sendPlan();
		else
			update_front_with_msg({success:[false], global_msg:["Veuillez au préalable remplir votre profil afin de pouvoir créer votre abonnement !"]}, "pro-payment-msg");
	else
		deletePlan();
})
function deletePlan(){
	var datas = {
		id: user.id,
		email: user.mail,
		token: token
	};
	$.ajax({
		type: "POST",
		url: "/delete-plan",
		beforeSend: function (req){
			req.setRequestHeader("x-access-token", token);
		},
		data: datas,
		async: false,
		success: function (data){
			update_front_with_msg(data, "pro-payment-msg");
			//console.log(data);
			//Refresh de page cause --> trop d'éléments à maj
			window.location.reload();
		}
	})
}
function sendPlan() {
	var stripePublishableKey = 'pk_test_L0T2zWeT0uLcyhZCD1Nfqzx2';
	var currency = 'eur';
	//console.log(user);
	var data = {
		email: user.mail,
		desc: 'Label-OnAir accès complet !',
		nom: user.nom,
		prenom: user.prenom,
		price: price
	};
	var stripe = Stripe(stripePublishableKey, {
		betas: ['payment_intent_beta_3']
	});
	// Create Checkout's handler
	var handler = StripeCheckout.configure({
		key: stripePublishableKey,
		name: 'Label-OnAir',
		image: '/asset/images/logo-onair.jpg',
		locale: 'auto',
		email: data.email,
		token: handlePlanToken,
		currency: currency
	});
	// Open Checkout with further options:
	handler.open({
		amount : 1999,
		description: data.desc,
		allowRememberMe: true
	});
	function handlePlanToken(token) {
		stripe.createSource({
			type: 'card',
			token: token.id
		}).then((result) => {
			data.cardToken = token.id;
			check_3d_secure(result);
		});
	}
	function check_3d_secure(response) {
		//console.log(response)
		// check the 3DS source's status
		var date_entr = new Date(business.dateOfBirth);
		if (response.error) {
			var message = response.error.message;
			displayResult("Unexpected 3DS source creation response status: " + status + ". Error: " + message);
			return;
		}
		if (response.source.card.three_d_secure == 'not_supported') {
			data.sourceId = response.source.id;
			displayResult("This card does not support 3D Secure authentication, but liability will be shifted to the card issuer.");
			//console.log(date_entr);
			stripe.createToken('account', {
				name: user.name,
				legal_entity: {
					business_name: business.name,
					business_tax_id: business.siren, 
					address : {
						city: business.city,
						line1: business.rue,
						postal_code: business.dpt,
						state: "FRANCE"
					},
					first_name: user.prenom,
					last_name: user.nom,
					type: "company",
					dob: {
						day: parseInt(date_entr.to2Digits4YearsString().substring(2, 4)),
                        month: parseInt(date_entr.to2Digits4YearsString().substring(4, 6)),
                        year: parseInt(date_entr.to2Digits4YearsString().substring(6))
					}
				},
				tos_shown_and_accepted: true,
			})
			.then((tok) => {
				if (!tok.error)
				{
					data.accountToken = tok.token.id;
					$.ajax({
						type: "POST",
						url: "/payment",
						data: data,
						async: false,
						beforeSend: function (req) {
							req.setRequestHeader("x-access-token", session.token);
						},
						success: function (data) {
							update_front_with_msg(data, "pro-payment-msg");
						}
					});
				}else{
					if (tok.error.param == "account[individual][dob][year]"){
						update_front_with_msg({success:[false], msg_global:["Vous devez avoir au moins 13 ans pour utiliser les services de paiement !"]}, "pro-payment-msg");
					}else{
						update_front_with_msg({success:[false], msg_global:[tok.error.message]}, "pro-payment-msg");
					}
					console.log(tok.error)
				}
				
			});
		}else if(response.source.card.three_d_secure == 'required' || response.source.card.three_d_secure == 'optional' ||response.source.card.three_d_secure == 'recommended'){
			stripe.createToken('account', {
				name: user.name,
				legal_entity: {
					business_name: business.name,
					business_tax_id: business.siren, 
					address : {
						city: business.city,
						line1: business.rue,
						postal_code: business.dpt,
						state: "FRANCE"
					},
					first_name: user.prenom,
					last_name: user.nom,
					type: "company",
					dob: {
						day: parseInt(date_entr.to2Digits4YearsString().substring(2, 4)),
                        month: parseInt(date_entr.to2Digits4YearsString().substring(4, 6)),
                        year: parseInt(date_entr.to2Digits4YearsString().substring(6))
					}
				},
				tos_shown_and_accepted: true,
			})
			.then((tok) => {
				if (!tok.error){
					$.ajax({
						type : 'GET',
						url : '/payment',
						data : {source : response.source.id},
						async: false,
						success : function(data){
							var returnURL = "http://localhost:4000/plan3dsecure?amount="+price+
								"&accountToken="+tok.token.id+
								"&src="+response.source.id+
								"&cust="+data.customer.id;					
							stripe.createSource({
								type: 'three_d_secure',
								amount: price,
								currency: "eur",
								three_d_secure: {
									customer : data.customer.id,
									card: response.source.id
								},
								redirect: {
									return_url: returnURL,
								},
							}).then((response) =>{
								// console.log('response: ');
								// console.log(response.source);
								if (response.error === undefined)
									window.location.assign(response.source.redirect.url);
							}).catch((err) => console.log(err));
						}
					})
				}else{
					console.log(tok.err)
				}
			});
		} else if (response.source.status != 'pending') {
			displayResult("Unexpected 3D Secure status: " + response.source.status);
		}
	}
}
function displayResult(msg){
	console.log(msg);
}
// Date.toInputFormattedString = function(delim) {
// 	return this.getUTCFullYear().toString(10) + delim +
// 		(this.getUTCMonth() + 1).toString(10).padStart(2, '0') + delim +
// 		this.getUTCDate().toString(10).padStart(2, '0');
// };
Date.prototype.toInputFormattedString = function(delim) {
	return this.getUTCFullYear().toString(10) + delim +
		(this.getUTCMonth() + 1).toString(10).padStart(2, '0') + delim +
		this.getUTCDate().toString(10).padStart(2, '0');
};
Date.prototype.to2DigitsString = function() {
    return this.getUTCHours().toString(10).padStart(2, '0') +
        this.getUTCDate().toString(10).padStart(2, '0') +
        (this.getUTCMonth() + 1).toString(10).padStart(2, '0') +
        this.getUTCFullYear().toString(10).substring(2);
};
Date.prototype.to2Digits4YearsString = function() {
    return this.getUTCHours().toString(10).padStart(2, '0') +
        this.getUTCDate().toString(10).padStart(2, '0') +
        (this.getUTCMonth() + 1).toString(10).padStart(2, '0') +
        this.getUTCFullYear().toString(10);
};