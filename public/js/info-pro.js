function on_offre_valid_link_click(event){
		event.preventDefault();
		console.log($(event.target).parents("a[data-action='offre']"));
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
			success: function(data){
				console.log(data);
				//localStorage.setItem("datas", JSON.stringify(data));
				//document.location = "/info-pro";
				update_front_with_msg(data, "msg-tab");
				if (!data.success[0])
					update_front_with_errors(data.errors);
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
	        url : "http://localhost:4000/get_cities_in_cp",
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
			success: function (data){
				//localStorage.setItem("datas", JSON.stringify(data));
				//document.location = "/info-pro";
				update_front_with_msg(data, "msg-service");
				if (!data.success)
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
			success: function (data){
				update_front_with_msg(data, "msg-tab");
				if (!data.success)
					update_front_with_errors(data.errors);
				//localStorage.setItem("datas", JSON.stringify(data));
				//document.location = "/info-pro";
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
	etab_valid_link.on("click", on_etab_valid_link_click);
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
	function update_front_with_errors(tabErr){
		update_front_with_success();
		$.each(tabErr, function (ind, val){
			var elem = $("[name="+ind+"]");
			var title = "";
			console.log(elem);
			elem.attr("data-toggle", "tooltip");
			$.each(val, function (i, v){
				title += "- "+v+"\n";
			});
			if (elem.is("select[name='cp']")){
				//console.log(elem.selectpicker());
				elem.selectpicker();
				elem.selectpicker({title: title}).selectpicker('render');
				var html = '';
    			elem.html(html);
				elem.selectpicker("refresh");
			}else{
				elem.attr("data-title", title);
				elem.attr("data-original-title", title);
			}
		});
		$('[data-toggle="tooltip"]').tooltip('enable');
	}
	function update_front_with_msg(ret, dataName){
		$('.global_msg').remove();
		var content = "";
		$.each(ret, function (ind, val){
			var elem = $("."+dataName);
			//console.log(elem);
			//elem.after();
			if (ind == "global_msg"){
				content += '<div class="global_msg">';
				$.each(val, function (i, v){
					if (!ret.success[i])
						content += '<div class="error-box margin-top-30"><p>'+v+'</p><div class="small-triangle"></div><div class="small-icon"><i class="jfont">&#xe80f;</i></div></div>';
					else{
						content += '<div class="success-box margin-top-30"><p>'+v+'</p><div class="small-triangle"></div><div class="small-icon"><i class="jfont">&#xe816;</i></div></div>';
					}
				});
				content += '</div>';
				elem.after(content);		
			}
		});
		//$('[data-toggle="tooltip"]').tooltip();
	}
	function update_front_with_success(){
		$('[data-toggle="tooltip"]').tooltip('disable');
		$.each($("[name]"), function (ind, val){
			var elem = $(val);
			if (elem.is("select")){
				elem.selectpicker();
				elem.selectpicker({title: "Sélectionner :"}).selectpicker('render');
				elem.selectpicker("refresh");
			} else{
				$(this).removeAttr("data-title");
				$(this).removeAttr("data-original-title");
			}
			$(this).removeAttr("data-toggle");
		});
		
	}
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
export {update_front_with_msg, 
	update_front_with_errors, 
	update_front_with_success};