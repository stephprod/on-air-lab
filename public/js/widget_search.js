var parent = window.parent;
//console.log($(parent.document));
function search_action(e){
	e.preventDefault();
	panel_search_active = $("div#widget-wrapper");
	datas.filtre_type_service = panel_search_active.find("input[name='cc']:checked").val();
	//console.log(panel_search_active.find("input[name='cc']:checked"));
  	var service = panel_search_active.find("select[name^='transaction']").val();
  	var dispo = panel_search_active.find("select[name^='location']").val();
  	var code_postal = panel_search_active.find("select[name^='country']").val();
  	var ville = panel_search_active.find("select[name^='city']").val();
  	var prix = panel_search_active.find("div[id^='slider-range-price'].slider-range").slider("values");
  	var distance = panel_search_active.find("div[id^='slider-range-area'].slider-range");

  	datas.filtre_service = null;
	datas.filtre_dispo = null;
	datas.filtre_tarif = null;
	datas.filtre_ville = null;
	datas.filtre_code_postal = null;
	datas.filtre_distance = null;
  	//console.log(service);
  	//datas = {};
	if (prix !== undefined && prix != null){
		datas.filtre_tarif = prix;
	}
	if (dispo !== undefined && dispo != null){
		datas.filtre_dispo = dispo;
	}
	if (service !== undefined && service != null){
		datas.filtre_service = service;
	}
	if (ville !== undefined && ville != ""){
		datas.filtre_ville = [panel_search_active.find("select[name^='city'] option:checked").data("city"), panel_search_active.find("select[name^='city'] option:checked").data("long"), panel_search_active.find("select[name^='city'] option:checked").data("lat")];
	}
	if (code_postal !== undefined && code_postal != ""){
		datas.filtre_code_postal = code_postal;
	}
	if (distance.slider("values") != null && !distance.slider("option", "disabled")){
		datas.filtre_distance = distance.slider("values");
	}
	//console.log($("div#widget-wrapper"));
    //console.log(datas);
    //console.log(parent);
    var that = $(this);
    $.ajax({
		type : "POST",
		url : "/search",
		data:  datas,
		success: function(data) {
        	var filter_tag = "";
        	var ind = 0;
        	var len = 7;
        	$.each(datas, function(key, value) {
        		switch(key){
        			case "filtre_type_service":
        				if (value == 0)
        					filter_tag += "'Audio'";
        				else
        					filter_tag += "'Vidéo'";
        				break;
        			case "filtre_service":
        				var span=panel_search_active.find("span.filter-option.pull-left")[0];
        				if (value != null)
        					filter_tag += "'"+ $(span).text() +"'";
        				else
        					filter_tag += "'Tous Services'"
        				break;
        			case "filtre_dispo":
        				var span=panel_search_active.find("span.filter-option.pull-left")[3];
        				if (value != null)
        					filter_tag += "'"+ $(span).text() +"'";
        				else
        					filter_tag += "'Toutes disponibilités'"
        				break;
        			case "filtre_tarif":
        				//var span=$("span.filter-option.pull-left")[0];
        				if (value != null)
        					filter_tag += "'"+prix[0]+" - "+prix[1]+"€'";
        				else
        					filter_tag += "'Tous tarifs'"
        				break;
        			case "filtre_ville":
        				var span=panel_search_active.find("span.filter-option.pull-left")[2];
        				if (value != null)
        					filter_tag += "'"+$(span).text()+"'";
        				else
        					filter_tag += "'Toutes les villes'"
        				break;
        			case "filtre_code_postal":
        				var span=panel_search_active.find("span.filter-option.pull-left")[1];
        				if (value != null)
        					filter_tag += "'"+$(span).text()+"'";
        				else
        					filter_tag += "'Tous les codes postaux'"
        				break;
        			case "filtre_distance":
        				//var span=$("span.filter-option.pull-left")[0];
        				if (value != null)
        					filter_tag += "'"+value[0]+" - "+value[1]+"km'";
        				else
        					filter_tag += "'Toutes distances'"
        				break;
        		}
        		//console.log(ind+" "+len);
        		//console.log(key+" "+value);
        		if (ind < len - 1){
        			filter_tag += ", ";
        		}
        		ind++;
        	});
        	data.filter_tag = filter_tag
        	sessionStorage.setItem("search_res", JSON.stringify(data));
        	parent.document.location = that.attr('href');
		}   
    });
}
function cp_change_action(e, clickedIndex, isSelected, previousValue){
	var d = {};
	d.code_p = $(e.target).val();
	var ind = 0;
	ind = 2;
	$(slider_distance).slider('disable');
	//console.log($(this).parents("#switcher"));
	//console.log(d);
	$.ajax({
        type : "POST",
        url : "/get_cities_in_cp",
        data:  d,
        success: function(data) {
			//AFFICHER LES VILLES ISSUS DE LA BASE DE DONNEES
			//console.log(data.cities);
			$(select_cities).empty();
			$.each(data.cities, function(key, value) {
				$(select_cities).append("<option data-city='"+value.ville_nom+"' data-long='"+value.ville_longitude_deg+"' data-lat='"+value.ville_latitude_deg+"' value='"+value.ville_id+"'>"+value.ville_nom+" - "+value.ville_code_postal+"</option>");
			});
			$(select_cities).selectpicker('refresh');
        }   
    });
}
function cities_change(e, clickedIndex, isSelected, previousValue){
	var ind = 0;
	ind = 2;
	$(slider_distance).slider('enable');
}
function on_type_service_change(e){
	var type = $(this);
	type_serv_load(e, type.val());
}
function type_serv_load(e, new_type){
	var d = {};
	d.filtre_type_service = new_type;
	var n = new_type;
	//console.log(d);
	$.ajax({
        type : "POST",
        url : "/search",
        data:  d,
        success: function(data) {
			//AFFICHER LES SERVICES ISSUS DE LA BASE DE DONNEES
			if (e == null){
				select_cp.empty();
				$.each(data.cp, function(key, value) {
					select_cp.append("<option value='"+value.ville_departement+"'>"+value.ville_departement+"</option>");
				});
				select_cp.selectpicker('refresh');
			}
			select_audio_switcher.empty();
			$.each(data.content, function(key, value) {
				select_audio_switcher.append("<option value='"+value.id_service+"'>"+value.nom_service+"</option>");
			});
			select_audio_switcher.selectpicker('refresh');
			
    	}   
    });
}
function on_document_ready(){
	//Ajout des services dans la barre de recherche + filtres
	//console.log($(this));
	select_audio_switcher = $("select[name='transaction']");
	select_cities = $("select[name^='city']");
	select_cp = $("select[name^='country']");
	slider_distance = $("div[id^='slider-range-area']");
	radios_type_service_switcher = $("#widget-wrapper input[name='cc']");
	$('.bootstrap-select').selectpicker({
		 container: 'body',
		 selectedTextFormat: 'count > 2',
		 language: 'FR'
	});
	$(slider_distance).slider({});
	//$(slider_distance[1]).slider({});
	$(slider_distance).slider("disable");
	//$(slider_distance[1]).slider("disable");
	datas = {};
	panel_search_active = $("div[role='tabpanel'].active");
	//console.log(panel_search_active);
	datas.filtre_service = [];
	//console.log(select_audio);
	type_serv_load(null ,0);
    $("a[data-type='search']").on("click", search_action);
    select_cp.on("changed.bs.select", cp_change_action);
	select_cities.on("changed.bs.select", cities_change);
	radios_type_service_switcher.on("change", on_type_service_change);
}
var select_audio,
	select_audio_switcher,
	radios_type_service_switcher,
	select_video,
	select_cities,
	select_cp,
	slider_distance,
	datas = {},
	panel_search_active;
$(document).on("ready", on_document_ready);
/********** RANGE SLIDER **********/		
$(".slider-range").each( function( index ) {
	var sliderId = $( this ).attr('id');
	$( this ).slider({
		 range: true,
		 min:  parseFloat($( this ).attr("data-min")),
		 max: parseFloat($( this ).attr("data-max")),
		 values: [ parseFloat($( this ).attr("data-min")), parseFloat($( this ).attr("data-max")) ],
		 slide: function( event, ui ) {
			$( "#" + sliderId + "-value" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
		 }
	});
	$( "#" + sliderId + "-value" ).val( $( this ).slider( "values", 0 ) + " - " + $( this ).slider( "values", 1 ) );
});

/*$("div.slider[id^=slider-d-tva], div.slider[id^=slider-p-price], .slider[id^=slider-t-price]").each( function( index ) {
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
$("div.slider[id^=slider-p-qte], .slider[id^=slider-t-h]").each( function( index ) {
	var sliderId = $( this ).attr('id');
	$( this ).slider({
		 range: "min",
		 min:  parseFloat($( this ).attr("data-min")),
		 max: parseFloat($( this ).attr("data-max")),
		 value: parseFloat($( this ).attr("data-val")),
		 slide: function( event, ui ) {
			$( "#" + sliderId + "-value" ).val( ui.value );
		 }
	});
	$( "#" + sliderId + "-value" ).val( $( this ).slider( "value" ) );
});*/