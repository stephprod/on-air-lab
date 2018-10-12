//TRI ASYNC AJAX ISOTOP
var $grid =  $(".grid-offer-row");
var select_filter = $('.order-by-container select');
var search_res = JSON.parse(sessionStorage.getItem('search_res'));
//var session = JSON.parse(sessionStorage.getItem('session'));
var select_audio,
        select_audio_switcher,
        radios_type_service_switcher,
        select_video,
        select_cities,
        select_cp,
        slider_distance,
        datas = {},
        panel_search_active,
        pro_card_contact_link,
        elems_in_a_page = 0;
//console.log(pro_card_contact_link);
//console.log($grid);
//console.log(select_filter);
//console.log(pro_card_contact_link);
//console.log(session);
//sessionStorage.clear();
if (search_res != null){
    $("span.filter_flags").empty();
    $("span.filter_flags").append(search_res.filter_tag);
    //AFFICHER LES ETABLISSEMENT CORESPONDANT A LA RECHERCHE
    //console.log(data);
    $("span.len").empty();
    $("span.len").append(search_res.listEtab.length);
    $grid.isotope();
    $grid.isotope("destroy");
    $grid.empty();
    $.each(search_res.listEtab, function(key, value){
          updateListEtabInView(value);
    });
    //$grid.isotope();
    //$grid.isotope("reloadItems");
    initIsotop($grid);
    //console.log($('div.offer-pagination'));
    /*$('div.offer-pagination').remove();
    $('div.grid-offer-row').easyPaginate({
        paginateElement: 'div.grid-offer-col',
        elementsPerPage: 16,
        paginationNavClass: 'offer-pagination',
        prevButtonText: '<i class="jfont">&#xe800;</i>',
        firstButtonText: '<i class="jfont">&#xe800;&#xe800;</i>',
        lastButtonText: '<i class="jfont">&#xe802;&#xe802;</i>',
        nextButtonText: '<i class="jfont">&#xe802;</i>'
    });*/
    //Isotop reload
    //$grid.isotope("reloadItems");
}
function sort_etabs(sortB, sortA){
    //console.log("sort");
    //console.log($grid);
    //console.log(sortB);
    //console.log(sortA);
	$grid.isotope({ sortBy: sortB, sortAscending: sortA });
}
function on_select_filter_change(e){
    //console.log("select filter change !")
    var opt = select_filter.find("option:selected");
    //console.log(opt);
    // Get the element name to sort 
    var sortValue = opt.data('sort-value');
    // Get the sorting direction: asc||desc 
    var direction = opt.data('sort-direction');
    // convert it to a boolean
    var isAscending = (direction == 'asc');
    //var newDirection = (isAscending) ? 'desc' : 'asc';
    sort_etabs(sortValue, isAscending);
}
function updateListEtabInView(value){
        var type_service = value.type_service == "audio" ? 
            '<div class="transaction-type">audio</div>' : '<div class="estate-type">vidéo</div>' ;
        $grid.append('<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-offer-col"> '+
            '<div class="grid-offer">'+
            '<div class="grid-offer-front">'+   
                '<div class="grid-offer-photo">'+
                    '<img src="'+value.path_img+'" width="262" height="178" alt="" />'+
                    '<div class="type-container">'+
                        type_service+
                        '<div class="etiquette-name">'+value.nom+'</div>'+
                    '</div>'+
                '</div>'+
                '<div class="grid-offer-text">'+
                    '<i class="fa fa-map-marker grid-offer-localization"></i>'+
                    '<div class="grid-offer-h4"><h4 class="grid-offer-title">'+value.adresse+', '+value.cp+'</h4></div>'+
                    '<div class="clearfix"></div>'+
                    '<p>'+value.descr+'</p>'+
                    '<div class="clearfix"></div>'+
                '</div>'+
                '<div class="price-grid-cont">'+
                    '<div class="grid-price-label pull-left">Price:</div>'+
                    '<div class="grid-price pull-right">'+
                        '€ <span class="tri-prix">'+value.prix_h+'</span> /h'+
                    '</div>'+
                    '<div class="clearfix"></div>'+
                '</div>'+
                '<div class="grid-offer-params">'+
                    '<div class="grid-area">'+
                        '<img src="/asset/images/area-icon.png" alt="" /><span class="distance">'+value.distance.toFixed(2)+'</span>km '+
                    '</div>'+
                    '<div class="grid-rooms">'+
                        '<img src="/asset/images/rooms-icon.png" alt="" />3'+
                    '</div>'+
                    '<div class="grid-baths">'+
                        '<img src="/asset/images/bathrooms-icon.png" alt="" />1'+
                    '</div>'+
                '</div>'+
                '</div>'+
                '<div class="grid-offer-back">'+
                    '<div id="grid-map1" class="grid-offer-map"></div>'+
                    '<div class="button">   '+
                        '<a href="#" class="button-primary" data-temp="'+value.id_user+'">'+
                            '<span>Voir profil</span>'+
                            '<div class="button-triangle"></div>'+
                            '<div class="button-triangle2"></div>'+
                            '<div class="button-icon"><i class="far fa-user-circle"></i></div>'+
                        '</a>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>');
    }
    function updateListEtabEmptyInView(){
        $grid.append('Aucune enseigne n\'a été trouvée, changez les critères de votre recherche ou actualisez la page !');
    } 
    function search_action(e){
        panel_search_active = $("div[role='tabpanel'].active");
        datas.filtre_type_service = panel_search_active.data("service-type");
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
        //console.log(datas);
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
                $("span.filter_flags").empty();
                $("span.filter_flags").append(filter_tag);
                //AFFICHER LES ETABLISSEMENT CORESPONDANT A LA RECHERCHE
                //console.log(data);
                $("span.len").empty();
                $("span.len").append(data.listEtab.length);
                $grid.empty();
                $grid.isotope("destroy");
                $('div.offer-pagination').remove();
                if (data.listEtab.length == 0){
                    updateListEtabEmptyInView();
                    $('div.grid-offer-row').easyPaginate({
                        paginateElement: 'div.grid-offer-col',
                        elementsPerPage: elems_in_a_page,
                        paginationNavClass: 'offer-pagination',
                        prevButtonText: '<i class="jfont">&#xe800;</i>',
                        firstButtonText: '<i class="jfont">&#xe800;&#xe800;</i>',
                        lastButtonText: '<i class="jfont">&#xe802;&#xe802;</i>',
                        nextButtonText: '<i class="jfont">&#xe802;</i>'
                    });
                }else{
                    $.each(data.listEtab, function(key, value){
                        updateListEtabInView(value);
                    });
                    initIsotop($grid);
                    $('div.grid-offer-row').easyPaginate({
                        paginateElement: 'div.grid-offer-col',
                        elementsPerPage: elems_in_a_page,
                        paginationNavClass: 'offer-pagination',
                        prevButtonText: '<i class="jfont">&#xe800;</i>',
                        firstButtonText: '<i class="jfont">&#xe800;&#xe800;</i>',
                        lastButtonText: '<i class="jfont">&#xe802;&#xe802;</i>',
                        nextButtonText: '<i class="jfont">&#xe802;</i>'
                    });
                    //$grid.isotope();
                }
                //Isotop reload
                //$grid.isotope("reloadItems");
            }   
        });
    }
    function cp_change_action(e, clickedIndex, isSelected, previousValue){
        var d = {};
        d.code_p = $(e.target).val();
        var ind = 0;
        ind = panel_search_active.data("service-type");
        $(slider_distance[ind]).slider('disable');
        //console.log($(this).parents("#switcher"));
        //console.log(d);
        $.ajax({
            type : "POST",
            url : "/get_cities_in_cp",
            data:  d,
            success: function(data) {
                //AFFICHER LES VILLES ISSUS DE LA BASE DE DONNEES
                $(select_cities[ind]).empty();
                $.each(data.cities, function(key, value) {
                    $(select_cities[ind]).append("<option data-city='"+value.ville_nom+"' data-long='"+value.ville_longitude_deg+"' data-lat='"+value.ville_latitude_deg+"' value='"+value.ville_id+"'>"+value.ville_nom+" / "+value.ville_code_postal+"</option>");
                });
                $(select_cities[ind]).selectpicker('refresh');
            }   
        });
    }
    function cities_change(e, clickedIndex, isSelected, previousValue){
        var ind = 0;
        ind = panel_search_active.data("service-type");
        $(slider_distance[ind]).slider('enable');
    }
    function on_type_service_change(e){
        var type = $(this);
        type_serv_load(e, type.val());
    }
    function type_serv_load(e, new_type){
        datas.filtre_type_service = new_type;
        var n = new_type;
        //console.log(datas);
        $.ajax({
            type : "POST",
            url : "/search",
            data:  datas,
            success: function(data) {
                //AFFICHER LES SERVICES ISSUS DE LA BASE DE DONNEES
                if (n == 0 && e == null){
                    select_audio.empty();
                    select_audio_switcher.empty();
                    $.each(data.content, function(key, value) {
                        select_audio.append("<option value='"+value.id_service+"'>"+value.nom_service+"</option>");
                        select_audio_switcher.append("<option value='"+value.id_service+"'>"+value.nom_service+"</option>");
                    });
                    select_audio.selectpicker('refresh');
                    select_audio_switcher.selectpicker('refresh');
                    select_cp.empty();
                    $.each(data.cp, function(key, value) {
                        select_cp.append("<option value='"+value.ville_departement+"'>"+value.ville_departement+"</option>");
                    });
                    select_cp.selectpicker('refresh');
                }else if(n == 1 && e == null){
                //AFFICHER LES SERVICES ISSUS DE LA BASE DE DONNEES
                  select_video.empty();
                  $.each(data.content, function(key, value) {
                    select_video.append("<option value='"+value.id_service+"'>"+value.nom_service+"</option>");
                  });
                 select_video.selectpicker('refresh');
                }else{
                    select_audio_switcher.empty();
                    $.each(data.content, function(key, value) {
                        select_audio_switcher.append("<option value='"+value.id_service+"'>"+value.nom_service+"</option>");
                    });
                    select_audio_switcher.selectpicker('refresh');
                }
            }   
        });
    }
    function on_pro_card_contact_link_click(e){
        e.preventDefault();
        var link = $(e.target).parents("a[data-temp]");
        var id_u = link.data("temp");
        //console.log("click pro card contact link !");
        $.ajax({
            type : "POST",
            url : "/secure_profile",
            data: {"temp": id_u},
            success: function(data) {
                //AFFICHER LES SERVICES ISSUS DE LA BASE DE DONNEES
                //console.log(data)
                document.location.href = '/profile/'+id_u;
            }   
        });
    }
    function on_document_ready(){
        //Ajout des services dans la barre de recherche + filtres
        select_audio = $("select[name='transaction1']");
        select_video = $("select[name='transaction2']");
        select_audio_switcher = $("select[name='transaction']");
        select_cities = $("select[name^='city']");
        select_cp = $("select[name^='country']");
        slider_distance = $("div[id^='slider-range-area']");
        radios_type_service_switcher = $("#switcher input[name='cc']");
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
        type_serv_load(null, 1);
        $("a[data-type='search']").on("click", search_action);
        select_cp.on("changed.bs.select", cp_change_action);
        select_cities.on("changed.bs.select", cities_change);
        radios_type_service_switcher.on("change", on_type_service_change);
        //TRI AJAX ISOTOP
        initIsotop($grid);
        //PAGINATION
        elems_in_a_page = 16;
        $grid.easyPaginate({
            paginateElement: 'div.grid-offer-col',
            elementsPerPage: elems_in_a_page,
            paginationNavClass: 'offer-pagination',
            prevButtonText: '<i class="jfont">&#xe800;</i>',
            firstButtonText: '<i class="jfont">&#xe800;&#xe800;</i>',
            lastButtonText: '<i class="jfont">&#xe802;&#xe802;</i>',
            nextButtonText: '<i class="jfont">&#xe802;</i>'
        });
        //pro_card_contact_link = $('a[data-temp]');
        //pro_card_contact_link.on("click", on_pro_card_contact_link_click);
    }
function initIsotop($parent){
    $parent.isotope({
        itemSelector:".grid-offer-col",
        getSortData:{
            name:".etiquette-name",
            price: function (itemElem){
                // get text of .tri-prix element
                var price = $( itemElem ).find('.tri-prix').text();
                // replace parens (), and parse as float
                return parseFloat( price );
            },
            distance: function (elem){
                var distance = $(elem).find(".distance").text();
                return parseFloat(distance);
            } 
        }
    });
}
//Sécurisation profile
$(document).on("click", 'a[data-temp]', on_pro_card_contact_link_click);
$(document).on("ready", on_document_ready);
//sort_etabs('price', true);
$(document).on("change", select_filter, on_select_filter_change);
/*$grid.on( 'arrangeComplete', function( event, filteredItems ) {
    console.log( 'Isotope arrange completed on ' +
      filteredItems.length + ' items' );
});*/