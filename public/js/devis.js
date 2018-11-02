import {update_front_with_msg, update_front_with_errors, update_front_with_success} from './front-update.js';
var servs = JSON.parse(sessionStorage.getItem('services'));
var session = JSON.parse(sessionStorage.getItem('session'));
var token = null;
var user = null;
var userId = null;
if (session.user !== undefined && session.user != null){
  user = session.user;
  userId = session.userId;
  token = session.token;
}
//console.log(sessionStorage.getItem('services'));
//console.log(servs);
//sessionStorage.clear();

function print_today() {

  var now = new Date();
  var months = new Array('January','February','March','April','May','June','July','August','September','October','November','December');
  var date = ((now.getDate()<10) ? "0" : "")+ now.getDate();
  function fourdigits(number) {
    return (number < 1000) ? number + 1900 : number;
  }
  var today =  months[now.getMonth()] + " " + date + ", " + (fourdigits(now.getYear()));
  return today;
}

// from http://www.mediacollege.com/internet/javascript/number/round.html
function roundNumber(number,decimals) {
  var newString;// The new rounded number
  decimals = Number(decimals);
  if (decimals < 1) {
    newString = (Math.round(number)).toString();
  } else {
    var numString = number.toString();
    if (numString.lastIndexOf(".") == -1) {// If there is no decimal point
      numString += ".";// give it one at the end
    }
    var cutoff = numString.lastIndexOf(".") + decimals;// The point at which to truncate the number
    var d1 = Number(numString.substring(cutoff,cutoff+1));// The value of the last decimal place that we'll end up with
    var d2 = Number(numString.substring(cutoff+1,cutoff+2));// The next decimal, after the last one we want
    if (d2 >= 5) {// Do we need to round up at all? If not, the string will just be truncated
      if (d1 == 9 && cutoff > 0) {// If the last digit is 9, find a new cutoff point
        while (cutoff > 0 && (d1 == 9 || isNaN(d1))) {
          if (d1 != ".") {
            cutoff -= 1;
            d1 = Number(numString.substring(cutoff,cutoff+1));
          } else {
            cutoff -= 1;
          }
        }
      }
      d1 += 1;
    } 
    if (d1 == 10) {
      numString = numString.substring(0, numString.lastIndexOf("."));
      var roundedNum = Number(numString) + 1;
      newString = roundedNum.toString() + '.';
    } else {
      newString = numString.substring(0,cutoff) + d1.toString();
    }
  }
  if (newString.lastIndexOf(".") == -1) {// Do this again, to the new string
    newString += ".";
  }
  var decs = (newString.substring(newString.lastIndexOf(".")+1)).length;
  for(var i=0;i<decimals-decs;i++) newString += "0";
  //var newNumber = Number(newString);// make it a number if you like
  return newString; // Output the result to the form field (change for your purposes)
}

function update_total() {
  var totalHT = 0.0;
  var totalTT = 0.0;
  var tva = parseFloat($('table#items').data("tva"));
  var fees = 0.0;
  var price = 0.0;
  $('.priceht').each(function(i){
  	$(this).slider();
    price = $(this).slider('value');
    if (!isNaN(price)) totalHT += Number(price);
  });

  totalHT = roundNumber(totalHT,2);
  fees = totalHT * tva;
  fees = roundNumber(fees,2);
  totalTT = (parseFloat(totalHT) + (parseFloat(totalHT) * tva));
  //console.log(totalTT);
  $('#subtotal').html(totalHT+"€");
  $('#fees').html(fees);
  $('#total').html(totalTT+"€");
}


function update_price() {
  var row = $(this).parents('.item-row');
  var price = row.find('.cost').slider('value') * row.find('.qty').slider('value');
  price = roundNumber(price,2);
  //isNaN(price) ? row.find('.price').html("N/A") : row.find('.price').html(price+"€");
  var sliderId = $(row.find('.priceht')[0]).attr("id");
  $(row.find('.priceht')[0]).slider('value', price);
  $( "#" + sliderId + "-value" ).val( price );
  update_total();
}

function update_price_devis(e){
	$(this).slider();
	var totalHT = parseFloat($(this).parents(".item-row").find(".ht").val().replace("€", ""));
  	var totalTT = 0.0;
  	var tva = parseFloat($(this).slider("value")) / 100 ;
  totalTT = (parseFloat(totalHT) + (parseFloat(totalHT) * tva));
  //console.log(totalTT);
  totalTT = roundNumber(totalTT, 2);
  $(this).parents(".item-row").find(".ttc").html(totalTT+"€");
}

$(document).on("slidechange", ".cost, .qty", update_price);
$(document).on("slidechange", ".tva", update_price_devis);

function sliders_presta_bind(){
	$("div[id^='slider-p-price']").each( function (ind){
		var sliderId = $( this ).attr('id');
		$(this).slider({
	    range: "min",
      step: 0.1,
			min:  parseFloat($(this).attr("data-min")),
			max: parseFloat($(this).attr("data-max")),
			value: parseFloat($(this).attr("data-val")),
			slide: function( event, ui ) {
				$( "#"+sliderId+"-value" ).val( ui.value );
			}
		});
		$( "#" + sliderId + "-value" ).val( $( this ).slider( "value" ) );
	});
  $("div[id^='slider-p-qte']").each( function (ind){
    var sliderId = $( this ).attr('id');
    $(this).slider({
        range: "min",
      min:  parseFloat($(this).attr("data-min")),
      max: parseFloat($(this).attr("data-max")),
      value: parseFloat($(this).attr("data-val")),
      slide: function( event, ui ) {
        $( "#"+sliderId+"-value" ).val( ui.value );
      }
    });
    $( "#" + sliderId + "-value" ).val( $( this ).slider( "value" ) );
  });
	$("div[id^='slider-p-priceht']").slider("disable");
}

function selects_presta_bind(){
  $("select[name^='service']").each( function (ind){
    $(this).selectpicker({
       container: 'body',
       selectedTextFormat: 'count > 2',
       language: 'FR'
    });
  });
}

function insert_services(id, ind){
  var ret = "";
  //console.log(servs);
  if (servs.length == 0)
    ret = '<select name="service'+ind+'" class="bootstrap-select" title="Service:" >'+
              '<option value="0">Aucun service.</option>'+
            '</select>';
  else{
    ret = '<select name="service'+ind+'" class="bootstrap-select" title="Service:" >';
    for (var k in servs){
      if (id == servs[k].id_service)
        ret += '<option value="'+servs[k].id_service+'" selected >'+servs[k].nom_service+'</option>';
      else
        ret += '<option value="'+servs[k].id_service+'" >'+servs[k].nom_service+'</option>';
    }     
    ret +='</select>';
  }
  return ret;
}

  $('input').click(function(){
    $(this).select();
  });
   
  $(document).on("click", "#addrow_presta", function(e){
    var len = $("table#items .item-row").length;
    $(".item-row:last").after('<tr class="item-row" data-presta="0"><td class="item-name"><div class="delete-wpr">'+insert_services(0, (len + 1))+'<a class="delete_presta" href="javascript:;" title="Remove row">X</a></div></td><td class="description"><textarea>Nouvelle description...</textarea></td><td><span>€</span><input type="text" id="slider-p-priceU'+(len + 1)+'-value" class="adv-search-amount"><div class="clearfix"></div><div id="slider-p-priceU'+(len + 1)+'" data-val="0" data-min="0" data-max="10000" class="slider cost"></div></td><td><span></span><input type="text" id="slider-p-qte'+(len + 1)+'-value" class="adv-search-amount"><div class="clearfix"></div><div id="slider-p-qte'+(len + 1)+'" data-val="0" data-min="0" data-max="100" class="slider qty"></div></td><td><span class="price"><span>€</span><input type="text" id="slider-p-priceht'+(len + 1)+'-value" class="adv-search-amount"><div class="clearfix"></div><div id="slider-p-priceht'+(len + 1)+'" data-val="0" data-min="0" data-max="1000000" disabled="true" class="slider priceht"></div></span></td>');
    //if ($(".delete_presta").length > 0) $(".delete_presta").show();
    //bind_presta();
    sliders_presta_bind();
    selects_presta_bind();
    //console.log($("table#items .item-row:not([data-presta='0'])"));
    //if ($("table#items .item-row:not([data-presta='0'])").length < 2)
  });

  $(document).on("click", "#addrow_devis", function(e){
  	var last_tr = $( this ).parents("tr");
  	var nb = $(this).parents("table").find('tr.item-row').length;
  	var sliderId = "#slider-d-tva"+ (nb + 1);
  	//console.log(last_tr);
  	//console.log(nb);
    last_tr.before('<tr class="item-row" data-devis="0"><td class="item-name"><div class="delete-wpr"><textarea class="name">Nouveau Modèle...</textarea><a class="delete_devis" href="javascript:;" title="Remove row">X</a><a class="edit_devis" href="javascript:;" title="Edit row">+</a></div></td><td class="description"><span>%</span><input type="text" id="slider-d-tva'+ (nb + 1) +'-value" class="adv-search-amount"><div class="clearfix"></div><div id="slider-d-tva'+(nb + 1)+'" data-val="2.1" data-min="2" data-max="20" class="slider tva"></div></td><td><textarea readOnly class="ht">0€</textarea></td><td><textarea readOnly class="ttc">0€</textarea></td></tr>');
    if ($(".delete_devis").length > 0) $(".delete_devis").show();
    $(sliderId).slider({
    	range: "min",
		min:  parseFloat($(sliderId).attr("data-min")),
		max: parseFloat($(sliderId).attr("data-max")),
		value: parseFloat($(sliderId).attr("data-val")),
		step: 0.1,
		slide: function( event, ui ) {
			$( sliderId+"-value" ).val( ui.value );
		}
	});
	$( sliderId+"-value" ).val( $(sliderId).slider( "value" ) );
	console.log("click addRow devis !");
    //bind();
  });
  
  $(document).on('click', '.edit_models', function(e){
  	e.preventDefault();
  	$("table#items").hide();
	$("table#models").show();
	$("a[data-action='presta']").attr("data-action", "devis");
  });

  $(document).on('click', '.edit_devis', function(e){
  	var id_devis = $(this).parents('.item-row').data("devis");
    var name_devis = $(this).parents('.item-row').find("textarea.name").val();
    var tva = $(this).parents('.item-row').find("div[id^='slider-d-tva']").slider('value');
    var total_ht = parseFloat($(this).parents('.item-row').find("textarea.ht").val().replace("€", ""));
    var total_ttc = parseFloat($(this).parents('.item-row').find("textarea.ttc").val().replace("€", ""));
    //var allServ = <% locals.allServ !== undefined ? locals.allServ : "null" %>;
    var datas = {};
    var fees = 0.0;
    datas.id_dev = parseInt(id_devis);
    datas.action = "display";
    datas.total_ht= total_ht;
    datas.tva = tva / 100;
    datas.price_ttc= total_ttc;
    datas.name_dev = name_devis;
    //$(this).parents('.item-row').remove();
    //console.log("edit ok "+id_devis);
    //console.log(datas);
    $.ajax({
    	type: "POST",
    	url: "/devis",
      data: datas,
      beforeSend: function (req){
        req.setRequestHeader("x-access-token", token);
      },
    	success: function (data){
    		//console.log(data);
    		//console.log(allServ);
    		var total = 0.0
    		$(".items_title").empty();
    		$(".items_title").append(name_devis);
    		$("table#items").attr("data-tva", datas.tva);
    		$("table#items").attr("data-devis", data.devis_id);
    		$("table#items .item-row, table#items #hiderow, table#items .fix").remove();
    		if (data.prestas !== undefined)
    		{
    			$.each(data.prestas , function(k, val){
	    			$("table#items").append('<tr class="item-row" data-presta="'+val.id_presta+'"><td class="item-name"><div class="delete-wpr">'+insert_services(val.id_serv, (k + 1))+'<a class="delete_presta" href="javascript:;" title="Remove row">X</a></div></td><td class="description"><textarea>'+(val.descr != null ? val.descr : 'Nouvelle description...' )+'</textarea></td><td><span>€</span><input type="text" id="slider-p-priceU'+(k + 1)+'-value" class="adv-search-amount"><div class="clearfix"></div><div id="slider-p-priceU'+(k + 1)+'" data-val="'+val.price_u+'" data-min="0" data-max="10000" class="slider cost"></div></td><td><span></span><input type="text" id="slider-p-qte'+(k + 1)+'-value" class="adv-search-amount"><div class="clearfix"></div><div id="slider-p-qte'+(k + 1)+'" data-val="'+val.quantity+'" data-min="0" data-max="100" class="slider qty"></div></td><td><span class="price"><span>€</span><input type="text" id="slider-p-priceht'+(k + 1)+'-value" readOnly class="adv-search-amount"><div class="clearfix"></div><div id="slider-p-priceht'+(k + 1)+'" data-val="'+(val.price_u * val.quantity)+'" data-min="0" data-max="1000000" disabled="true" class="slider priceht"></div></span></td>');
	    			total += (val.quantity * val.price_u);
	    		});
    		}
    		else
    			$("table#items").append('<tr class="item-row"  data-presta="'+data.presta_id+'"><td class="item-name"><div class="delete-wpr">'+insert_services(0, 1)+'</div></td><td class="description"><textarea>Nouvelle description...</textarea></td><td><span>€</span><input type="text" id="slider-p-price0-value" class="adv-search-amount"><div class="clearfix"></div><div id="slider-p-price0" data-val="0" data-min="0" data-max="10000" class="slider cost"></div></td><td><span></span><input type="text" id="slider-p-qte0-value" class="adv-search-amount"><div class="clearfix"></div><div id="slider-p-qte0" data-val="0" data-min="0" data-max="100" class="slider qty"></div></td><td><span class="price"><span>€</span><input type="text" id="slider-p-priceht0-value" readOnly class="adv-search-amount"><div class="clearfix"></div><div id="slider-p-priceht0" data-val="0" data-min="0" data-max="1000000" disabled="true" class="slider priceht"></div></span></td>');
    		
    		fees = (total * datas.tva);
    		fees = roundNumber(fees,2);
    		$("table#items").append('<tr id="hiderow"><td colspan="5"><a id="addrow_presta" href="javascript:;" title="Add a row">Ajouter une nouvelle prestation</a></td></tr>');
    		$("table#items").append('<tr class="fix"><td colspan="2" class="blank"></td><td colspan="2" class="total-line">sous total</td><td class="total-value"><div id="subtotal">'+total+'€</div></td></tr>');
    		$("table#items").append('<tr class="fix"><td colspan="2" class="blank"></td><td colspan="2" class="total-line">TVA</td><td class="total-value"><div id="tva">'+(datas.tva * 100)+'% (<span id="fees">'+fees+'</span>€)</div></td></tr>');
    		$("table#items").append('<tr class="fix"><td colspan="2" class="blank"></td><td colspan="2" class="total-line">Total</td><td class="total-value"><div id="total"> '+(total + (total * datas.tva))+'€</div></td></tr>');
    		sliders_presta_bind();
	    	selects_presta_bind();
	    	$("table#models").hide();
	    	$("table#items").show();
	    	/*if ($(".delete_presta").length < 2)
	    		$(".delete_presta").hide();*/
	    	//console.log($("table#items .item-row:not([data-presta='0']):first"));
	    	$("table#items .item-row:not([data-presta='0']):first").find(".delete_presta").hide();
	    	$("a[data-action='devis']").attr("data-action", "presta");
    	}
    });
    //if ($(".delete_devis").length < 2) $(".delete").hide();
  });

	$(document).on("click", "a[data-action='presta']", function(e){
		e.preventDefault();
		var datas = {};
		datas.id_prestas = [];
		datas.services = [];
		datas.descr = [];
		datas.pricesU = [];
		datas.quantities = [];
		datas.pricesHT = [];
		datas.totalTT = 0;
		datas.totalHT = 0;
		datas.id_devis = 0;
		datas.action = "save"
		$.each($("table#items .item-row"), function (ind){
			$(this).find(".cost").slider();
			$(this).find(".qty").slider();
			$(this).find(".priceht").slider();
			datas.id_prestas.push(parseInt($(this).data("presta")));
			datas.services.push(parseInt($(this).find("select[name^='service']").selectpicker("val")));
			datas.descr.push($(this).find(".description textarea").val());
			datas.quantities.push($(this).find(".qty").slider("value"));
			datas.pricesU.push($(this).find(".cost").slider("value"));
			datas.pricesHT.push($(this).find(".priceht").slider("value"));
		});
		datas.totalTT = parseFloat($("#total").text().replace("€", ""));
		datas.totalHT = parseFloat($("#subtotal").text().replace("€", ""));
		datas.id_devis = parseInt($("table#items").data("devis"));
		datas.tva = parseFloat($("table#items").data("tva"));
		//console.log(datas);
		$.ajax({
			type: "POST",
      url: "/prestas",
      beforeSend: function (req){
				req.setRequestHeader("x-access-token", token);
			},
			data: datas,
			success: function (data){
        //localStorage.setItem("datas", JSON.stringify(data));
        //document.location = "/info-pro";
				//console.log(data);
        update_front_with_msg(data, "msg-tab");
        if (data.success[0])
          document.location = "/info-pro";
			}
		});
		console.log("save prestas click !");
	});

	$(document).on("click", "a[data-action='devis']", function(e){
		e.preventDefault();
		var datas = {};
		datas.id_devs = [];
		datas.action = "save";
		datas.names = [];
		datas.tvas = [];
		datas.pricesHT = [];
		datas.pricesTT = [];
		$.each($("table#models .item-row"), function (ind){
			$(this).find(".description .slider").slider();
			datas.id_devs.push(parseInt($(this).data("devis")));
			datas.names.push($(this).find(".item-name textarea").val());
			datas.tvas.push($(this).find(".description .slider").slider("value") / 100);
			datas.pricesHT.push(parseFloat($(this).find(".ht").val().replace("€", "")));
			datas.pricesTT.push(parseFloat($(this).find(".ttc").val().replace("€", "")));
		});
		console.log(datas);
		$.ajax({
			type: "POST",
			url: "/devis",
      data: datas,
      beforeSend: function (req){
        req.setRequestHeader("x-acces-token", token);
      },
			success: function (data){
        //console.log(data);
        //localStorage.setItem("datas", JSON.stringify(data));
        //document.location = "/info-pro";
        update_front_with_msg(data, "msg-tab");
			}
		});
		console.log("save devis click !");
	});

  $(document).on("click", ".delete_presta", function(e){
  	var datas = {}
    datas.id_presta = parseInt($(this).parents('.item-row').data("presta"));
    $(this).parents('.item-row').remove();
    update_total();
    //console.log("remove ok");
    if (datas.id_presta != 0){
	    datas.totalTT = parseFloat($("#total").text().replace("€", ""));
		  datas.totalHT = parseFloat($("#subtotal").text().replace("€", ""));
		  datas.id_devis = parseInt($("table#items").data("devis"));
  		//console.log(datas);
  		$.ajax({
  			type: "POST",
  			url: "/prestas",
  			data: datas,
  			success: function (data){
          console.log(data);
  				//localStorage.setItem("datas", JSON.stringify(data));
          //document.location.reload(true);
          update_front_with_msg(data, "msg-tab");
  			}
  		});
	}
    if ($(".delete_presta").length < 2) 
    	$(".delete_presta").hide();	
  });

  $(document).on("click", ".delete_devis", function(e){
  	var datas = {};
  	datas.id_dev = parseInt($(this).parents('.item-row').data("devis"));
  	datas.action = "delete";
  	var that = $(this);
  	$.ajax({
  		type: "POST",
  		url: "/devis",
      data: datas,
      beforeSend: function (req){
        req.setRequestHeader("x-access-token", token);
      },
  		success: function (data){
        //console.log(data);
  			//localStorage.setItem("datas", JSON.stringify(data));
        //document.location.reload(true);
        update_front_with_msg(data, "msg-tab");
        if (data.success[0])
          that.parents('.item-row').remove();
  		}
  	})
  });

  $(document).on("change", "table input", function(e){
  	var slider = $(this).parents("td").find("div[id^='slider']").slider();
  	var newNumber = parseFloat($(this).val());
  	//console.log("input change !"+newNumber);
  	if (isNaN(newNumber)){
  		slider.slider("value", 0);
  	}
  	else{
  		slider.slider("value", newNumber);
  	}
  });
  
  $("#cancel-logo").click(function(){
    $("#logo").removeClass('edit');
  });
  $("#delete-logo").click(function(){
    $("#logo").remove();
  });
  $("#change-logo").click(function(){
    $("#logo").addClass('edit');
    $("#imageloc").val($("#image").attr('src'));
    $("#image").select();
  });
  $("#save-logo").click(function(){
    $("#image").attr('src',$("#imageloc").val());
    $("#logo").removeClass('edit');
  });
  
  $("#date").val(print_today());