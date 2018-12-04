import {update_front_with_msg, update_front_with_errors, update_front_with_success} from './front-update.js';
	function on_offre_valid_link_click(event){
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
				update_front_with_msg(data, "msg-tab");
				if (!data.success[0])
					update_front_with_errors(data.errors);
				else
					document.location = "/info-pro";
			}
		});
	}
	function on_agent_photo_change(event){
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
				localStorage.setItem("datas", JSON.stringify(data));
				document.location = "/info-pro";
				//console.log(data);
			}
		});
	}
	function cp_change_action(e, clickedIndex, isSelected, previousValue){
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
	function on_tarif_slider_change(e, ui){
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
		var div = $("div#"+$(link[0]).data("form"));
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
				if (!data.success[0])
					update_front_with_errors(data.errors);
				else
					document.location = "/info-pro";
			}
		});
	}
	function on_etab_valid_link_click(e){
		var datas = {};
		e.preventDefault();
		var form = $("form[name='agent-form']");
		var nom, adresse, cp, description, siret;
		datas.cible = "etab";
		nom = form.find("[name='nom']").val();
		adresse = form.find("[name='adresse']").val();
		cp = parseInt(form.find("[name='cp'] option:selected").text().split("/")[1]);
		description = form.find("[name='descr']").val();
		siret = form.find("[name='siret']").val();
		datas.nom = nom;
		datas.adresse = adresse;
		datas.cp = cp;
		datas.descr = description;
		datas.siret = siret;
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
				update_front_with_msg(data, "msg-profile");
				if (!data.success[0])
					update_front_with_errors(data.errors);
				//localStorage.setItem("datas", JSON.stringify(data));
				//document.location = "/info-pro";
			}
		});
	}
	function on_off_delete_div_click(e){
		e.preventDefault();
		console.log("click on delete offre !");
		var datas = {};
		var that = $(this);
		var parentRow = $("div#home > div.row");
		datas.action = "delete";
		datas.id_offre = $(this).data("id-offre");
		console.log(datas);
		console.log($(this));
		$.ajax({
			type: "POST",
			url: "/create_off",
			data: datas,
			beforeSend: function (req){
				req.setRequestHeader("x-access-token", token);
			},
			success: function (data){
				update_front_with_msg(data, "msg-tab");
				//console.log(that.parents(".grid-offer-col"));
				if (data.success[0]){
					/*that.parents(".grid-offer-col").remove();
					parentRow.append(offre_add_card);
					$(".slider[id^=slider-o-price]").each( function( index ) {
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
					});*/
					document.location = "/info-pro";
				}
				//console.log(data);
			}
		});
	}
   	var off_valid_link = $("a[data-action='offre']");
   	off_valid_link.on("click", on_offre_valid_link_click);
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
	etab_valid_link.on("click", on_etab_valid_link_click);
	off_delete_div.on("click", on_off_delete_div_click);
	$(sliders_tarification[0]).slider({});
	$(sliders_tarification[1]).slider({});
	$(sliders_tarification[2]).slider({});
	$(sliders_tarification[0]).slider("disable");
	$(sliders_tarification[1]).on("slidechange", on_tarif_slider_change);
	$(sliders_tarification[2]).on("slidechange", on_tarif_slider_change);
	$.ajax({
		type: "POST",
		url: "/get_all_cp",
		success: function (data){
			//console.log(data);
			$.each(data.cp, function(key, value) {
				select_dpt.append("<option value='"+value.ville_departement+"'>"+value.ville_departement+"</option>");
			});
			$(select_dpt[0]).selectpicker('refresh');
		}
	});
	$(select_dpt[0]).on("changed.bs.select", cp_change_action);
	$(document).on("change", "#profile input[id^=slider-t-price-h], #profile input[id^=slider-t-h]"
		, function(e){
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
	$(".slider[id^=slider-o-price]").each( function( index ) {
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
	$(document).on("change", "input[id^=slider-o-price]", function(e){
	  	var slider = $(this).parents(".grid-offer-back").find("div[id^=slider-o-price]").slider();
	  	var newNumber = parseFloat($(this).val());
	  	if (isNaN(newNumber)){
	  		slider.slider("value", 0);
	  	}
	  	else{
	  		slider.slider("value", newNumber);
	  	}
	});
	var session = JSON.parse(sessionStorage.getItem('session'));
	//sessionStorage.clear();
	var user = null;
	var userId = null;
	var token = null;
	if (session != null && session.user != undefined){
		user = session.user;
		userId = user.id;
		token = session.token;
	}
	$(document).on('click', '#redirectAdmin', function(event) {
		event.preventDefault();
		$("#switcher-button2").trigger('click');
		$($('iframe[src="/chat"]')[0].contentDocument).find(".friend:nth-child(1)").trigger('click');
	});
var price = 20.85 * 100;
$(document).on('click', '#customButton', function(e) {
	e.preventDefault();
    sendPlan();
})

function sendPlan() {
	var stripePublishableKey = 'pk_test_L0T2zWeT0uLcyhZCD1Nfqzx2';
	var currency = 'eur';
	var data = {
		email: 'nilo@getMaxListeners.com',
		desc: 'test plan',
		nom: 'blemand',
		prenom: 'nilo',
		price: price
	};
	var stripe = Stripe(stripePublishableKey, {
		betas: ['payment_intent_beta_3']
	});
	// Create Checkout's handler
	var handler = StripeCheckout.configure({
		key: stripePublishableKey,
		image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
		locale: 'auto',
		allowRememberMe: false,
		email: data.email,
		token: handlePlanToken
	});
	// Open Checkout with further options:
	handler.open({
		name: 'Stripe.com',
		description: data.desc,
		currency: currency,
	});
	function handlePlanToken(token) {
		stripe.createSource({
			type: 'card',
			token: token.id
		}).then((result) => {
			// console.log(result);
			// console.log(token);
			//data.stripeToken = token.id;
			check_3d_secure(result);
		});
	}
	function check_3d_secure(response) {
		//console.log(response)
		// check the 3DS source's status
		if (response.error) {
			var message = response.error.message;
			displayResult("Unexpected 3DS source creation response status: " + status + ". Error: " + message);
			return;
		}
		if (response.source.card.three_d_secure == 'not_supported') {
			displayResult("This card does not support 3D Secure authentication, but liability will be shifted to the card issuer.");
			data.stripeToken = response.source.id;
			$.ajax({
				type: "POST",
				url: "/payment",
				data: data,
				beforeSend: function (req) {
					req.setRequestHeader("x-access-token", session.token);
				},
				success: function (data) {
					console.log('plan souscription ok!! ' + data);
				}
			});
		}else if(response.source.card.three_d_secure == 'required' || response.source.card.three_d_secure == 'optional' ||response.source.card.three_d_secure == 'recommended'){
			$.ajax({
				type : 'GET',
				url : 'http://localhost:4000/payment',
				data : {source : response.source.id},
				success : function(data){
					var returnURL = "http://localhost:4000/plan3dsecure?cust="+data.customer.id+"&amount="+price;
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
						//   console.log('response: ')
						//   console.log(response)
						  window.location.assign(response.source.redirect.url)
					});
				}
			})
		} else if (response.source.status != 'pending') {
			displayResult("Unexpected 3D Secure status: " + response.source.status);
		}
  }
}
function displayResult(msg){
	console.log(msg);
}