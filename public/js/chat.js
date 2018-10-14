  import {update_front_with_msg, update_front_with_errors, update_front_with_success} from './info-pro.js';

  	//import {get_events} from './profile.js';

	$(document).on("click", ".friend", function(){
		var childOffset = $(this).offset();
		var parentOffset = $(this).parent().parent().offset();
		var childTop = childOffset.top - parentOffset.top;
		var clone = $(this).find('img').eq(0).clone();
		var top = childTop+12+"px";
		$(clone).css({'top': top}).addClass("floatingImg").appendTo("#chatbox");

		setTimeout(function(){$("#profile p").addClass("animate");$("#profile").addClass("animate");}, 100);
		setTimeout(function(){
			$("#chat-messages").addClass("animate");
			$('.cx, .cy').addClass('s1');
			setTimeout(function(){$('.cx, .cy').addClass('s2');}, 100);
			setTimeout(function(){$('.cx, .cy').addClass('s3');}, 200);
		}, 150);

		$('.floatingImg').animate({
			'width': "68px",
			'left':'108px',
			'top':'20px'
		}, 200);

		var name = $(this).find("p strong").html();
		var email = $(this).find("p span").html();
		$("#profile p").html(name);
		$("#profile span").html(email);

		$(".message").not(".right").find("img").attr("src", $(clone).attr("src"));
		$('#friendslist').fadeOut();
		$('#chatview').fadeIn();

		$('#close').unbind("click").click(function(){
			$("#chat-messages, #profile, #profile p").removeClass("animate");
			$('.cx, .cy').removeClass("s1 s2 s3");
			$('.floatingImg').animate({
				'width': "40px",
				'top':top,
				'left': '12px'
			}, 200, function(){$('.floatingImg').remove()});

			setTimeout(function(){
				$('#chatview').fadeOut();
				$('#friendslist').fadeIn();
			}, 50);
		});
		if ($(this).data('coresp-type') == "4"){
			$($(".box-module .module")[0]).hide();
			$($(".box-module .module")[2]).show();
			$($(".box-module .module")[3]).hide();
			$($(".box-module .module")[1]).show();
			$($(".box-module .module")[4]).show();
			$($(".box-module .module")[5]).show();
			$("#devis-modal").find("h1").empty();
			$("#devis-modal").find("h1").append("Envoyer un devis");
		}
		else if($(this).data('coresp-type') == "1"){
			$($(".box-module .module")[0]).hide();
			$($(".box-module .module")[1]).hide();
			$($(".box-module .module")[2]).hide();
			$($(".box-module .module")[3]).hide();
			$($(".box-module .module")[4]).hide();
			$($(".box-module .module")[5]).hide();
		}
		else if ($(this).data('coresp-type') == "2"){
			$("select[name='services']").remove();
			$('#devis-modal').find('[name="msg"]').after('<select name="services" class="bootstrap-select" title="Services:" multiple data-actions-box="true"></select>');
			$($(".box-module .module")[0]).show();
			$($(".box-module .module")[1]).show();
			$($(".box-module .module")[2]).show();
			$($(".box-module .module")[3]).show();
			$($(".box-module .module")[4]).show();
			$($(".box-module .module")[5]).show();
			$("#devis-modal").find("h1").empty();
			$("#devis-modal").find("h1").append("Demande de devis");
			$('#devis-modal').find("a#devis-send span").empty();
			$('#devis-modal').find("a#devis-send span").append("Envoyer la demande");
		}else{
			$("select[name='services']").remove();
			$('#devis-modal').find('[name="msg"]').after('<select name="services" class="bootstrap-select" title="Services:" multiple data-actions-box="true"></select>');
			$($(".box-module .module")[0]).hide();
			$($(".box-module .module")[1]).show();
			$($(".box-module .module")[2]).show();
			$($(".box-module .module")[3]).show();
			$($(".box-module .module")[4]).show();
			$($(".box-module .module")[5]).show();
			$("#devis-modal").find("h1").empty();
			$("#devis-modal").find("h1").append("Demande de devis");
			$('#devis-modal').find("a#devis-send span").empty();
			$('#devis-modal').find("a#devis-send span").append("Envoyer la demande");
		}
		switchRoom($(this).data("room"), $(this).data("coresp"), name.split(" ")[0], name.split(" ")[1], $(this).data('coresp-type'), user);
	});
	function updateUserReceived(data){
        user_receiv = data;
    }
	function on_socket_update_rooms(rooms, current_room, coresp){
		console.log("updateroom");
		//console.log(coresp);
		//console.log(rooms);
		$("div#friends").empty();
		for (var i = 0; i < rooms.length; i++){
			$("div#friends").append('<div class="friend" data-coresp="'+rooms[i][0]+'" data-coresp-type="'+rooms[i][4]+'" data-room="'+rooms[i][1]+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><p><strong>'+rooms[i][2]+' '+rooms[i][3]+'</strong><span>'+rooms[i][5]+'</span><p class="preview">'+rooms[i][7]+'</p></p><div class="status available"></div></div>');
		}
	}
	function on_socket_connect(id){
		console.log("connect --> "+ userId);
		if (userId != null && userId != "null") {
            id = userId ;
            var type = user.type;
            var coresp = {};
            coresp.nom = "Admin";
            coresp.prenom = "amdin";
            coresp.id_coresp = 1;
            coresp.type = 1;
            socket.emit('adduser', id, type);
            console.log("TU ES DEJA CONNECTE :)");
            updateUserReceived(coresp);
        } else {
            console.log("CONNECTE TOI POUR UTILISER LE TCHAT NO HACK :)");
        }
	}
	function on_socket_updatechat(coresp, data, cont){
		console.log("updatechat");
		console.log(data);
		if (data !== undefined && data != null){
			var htmlToAppend = "";
			if (data.type_m !== undefined && data.type_m != null){
				if (data.type_m == 'audio'){
					if (user.id == data.user_sender)
						htmlToAppend += actions.audio[0](data);
					else
						htmlToAppend += actions.audio[1](data);
				}
				else if (data.type_m == 'video'){
					if (user.id == data.user_sender)
						htmlToAppend += actions.video[0](data);
					else
						htmlToAppend += actions.video[1](data);
				}
				else if (data.type_m == 'booking'){
					if (user.id == data.user_sender)
						htmlToAppend += actions.booking[0](data);
					else
						htmlToAppend += actions.booking[1](data);
				}
				else if (data.type_m == 'rdv'){
					if (user.id == data.user_sender)
						htmlToAppend += actions.rdv[0](data);
					else
						htmlToAppend += actions.rdv[1](data);
				}
				else if (data.type_m == 'devis_request'){
					if (user.id == data.user_sender)
						htmlToAppend += actions.devis_request[0](data);
					else
						htmlToAppend += actions.devis_request[1](data);
				}
				else if (data.type_m = 'contact'){
					//console.log(user);
					if (user.type == 4){
						if (user.id == data.user_sender)
							htmlToAppend += actions.contactArt[0](data);
						else
							htmlToAppend += actions.contactArt[1](data);
					}else{
						if (user.id == data.user_sender)
							htmlToAppend += actions.contactPro[0](data);
						else
							htmlToAppend += actions.contactPro[1](data);
					}
				}
				else{
					if (user.id == data.user_sender)
						htmlToAppend += actions.paiement[0](data);
					else
						htmlToAppend += actions.paiement[1](data);
				}
			}else{
				if (user.id == data.user_sender)
					htmlToAppend += actions.texte[0](data);
				else
					htmlToAppend += actions.texte[1](data);
			}
			$('#chat-messages').append(htmlToAppend);
		}
		if (data.user_sender != "SERVER")
            socket.emit('update_preview_in_room', data, cont);
	}
	function switchRoom(room, id_coresp, nom, prenom, type, usr){
		console.log("switch room");
		console.log(usr);
		var coresp= {};
        coresp.nom = nom;
        coresp.prenom = prenom;
        coresp.id_coresp = id_coresp;
        coresp.type = type;
        console.log(coresp);
        updateUserReceived(coresp);
        roomDisplay = room;
		$('#chat-messages').empty();
		$('#chat-messages').data('current', room);
		//Mise a jours de la session avec le nouveau correspondant
		var datas = {}
		datas.corresp = user_receiv
		//console.log(datas);
		$.ajax({
			type: "POST",
			url: "/chat",
			data: datas,
			success: function (data){
				//console.log(data);
			}
		});
		//console.log(room);
		if (usr.id != "null" && usr.id != null){
			if (room == 1 && usr.id != 1)
	            socket.emit('list_msg_admin', room, user_receiv, usr.id);
	        else{
	            socket.emit('list_msg', room, user_receiv, usr.type);
	            socket.emit('update_services', usr.id, room, user_receiv);
	            //socket.emit('update_modeles_devis', user.id, room, user_receiv);
	        }
        	socket.emit('switchRoom', usr.id, room, user_receiv);
        }
	}
	function on_socket_updatepreview(tabCorresp, cont){
		console.log("update_preview"+tabCorresp[1]);
		//console.log(tabCorresp);
		var div_to_update = null;
		if (cont !== undefined && cont == "iframe-chat"){
			var iframe = $("iframe[src='/chat']")[0] !== undefined ? $("iframe[src='/chat']")[0].contentDocument : null;
			div_to_update = $("div#friends .friend[data-room='"+tabCorresp[1]+"']", iframe);
		}
    	else
    		div_to_update = $("div#friends .friend[data-room='"+tabCorresp[1]+"']");
    	console.log(div_to_update);
    	console.log(cont);
    	div_to_update.find("p.preview").empty();
    	div_to_update.find("p.preview").append(tabCorresp[7]);
	}
	$("#searchfield").focus(function(){
		if($(this).val() == "Search contacts..."){
			$(this).val("");
		}
	});
	$("#searchfield").focusout(function(){
		if($(this).val() == ""){
			$(this).val("Search contacts...");

		}
	});
	function on_msg_send_click(){
		var message = $("#sendmessage textarea").val();
		var data = {};
		var room = $('#chat-messages').data('current');
		if(userId != "null"){
			$('#sendmessage textarea').val('');
			data.txt = message;
			socket.emit('sendchat', data, userId, user_receiv, null);
		}
	}
	function on_msg_send_keypress(){
        if(e.which == 13) {
            $(this).blur();
            $('#sendmessage button#send').focus().click();
        }
    }
	$("#sendmessage input").focus(function(){
		if($(this).val() == "Send message..."){
			$(this).val("");
		}
	});
	$("#sendmessage input").focusout(function(){
		if($(this).val() == ""){
			$(this).val("Send message...");

		}
	});
    function on_reservation_link_click(e){
    	e.preventDefault();
    	//console.log($(".cal"));
    	var iframe = $(this).hasClass("booking-chat") ? iframe_cal2 : iframe_cal1 ;
    	//console.log($(iframe).find("#selectHours"));
    	var datePickerVal = $(iframe).find(".datepicker input").val().replace(new RegExp("/", "g"), "-");
    	var datePickerValTab = datePickerVal.split("-");
    	var hours = $(iframe).find("#selectHours .sel");
    	var datas = {};
    	datas = get_events(hours, datePickerValTab);
    	if (user.type == 4){
    		datas.id_art = user.id;
			datas.id_pro = user_receiv.id_coresp;
    	}
		else{
			datas.id_art = user_receiv.id_coresp;
			datas.id_pro = user.id;
		}
		datas.user_receiv = user_receiv.id_coresp;
		datas.user_sender = user.id;
		datas.room = roomDisplay;
		if ($(this).hasClass("meet-up-chat")){
			datas.from = "rdv";
			datas.title = "event-meet";
		}
		else{
			datas.from = "booking";
			datas.title = "event-work";
		}
		console.log(datas);
		$.ajax({
			type: "POST",
			url: "/check-in",
			data: datas,
			success: function (data){
				console.log(data);
				if (data.result.type_r == "rdv")
					update_front_with_msg(data, "msg-rdv");
				else
					update_front_with_msg(data, "msg-booking");
				if (data.success[0]){
					//Emission de la socket
					console.log("rdv envoyé !" +userId);
                    var rdv = {
                        type_m : data.result.type_r,
                        user_receiver : user_receiv,
                        txt : data.msg,
                        events: datas.events,
                        id_disp: data.result.id_dispos,
                        created: data.created,
                        request_state : 0
                    }
                    //console.log(rdv);
                    socket.emit('sendchat', rdv, userId, user_receiv, null);
                }
                else
                	update_front_with_errors(data.errors);
			}
		});
    }
    /*Module sons*/
    function on_form_song_submit(e){
    	e.preventDefault();
        var formData = new FormData(e.target);
        var that = $(this);
        //console.log(e.target);
        $.ajax({
            type : that.attr('method'),
            url : that.attr('action'),
            processData: false,
            contentType: false,
            data: formData,
            success: function(data) {
                //console.log(data);
                update_front_with_msg(data, "msg-song");
				if (!data.success[0])
					update_front_with_errors(data.errors);
				else{
					/*Emmistion de socket*/
                    console.log("audio enregistré !" +userId);
                    var song = {
                        type_m : data.result.type_a,
                        path: data.result.path,
                        user_receiver : user_receiv,
                        txt : data.msg
                    }
                    //console.log(song);
                    socket.emit('sendchat', song, userId, user_receiv, null);
				}
            }
        });
    }
    function on_input_file_ghost_change(e){
    	console.log("input change");
    	input_text.val($(this).val().split("\\").pop());
    }
    function on_input_text_mousedown(e){
    	input_file_ghost.click();
    	return false;
    }
    function on_song_module_send_link_click(e){
    	e.preventDefault();
    	form_song.submit();
    }
    function on_socket_update_eventstypemessage(data){
    	console.log("events_type_message");
    	console.log(data);
    	var div = $("div[id-message='"+data.id_m+"']");
    	div.find("p.date_creneau").empty();
    	var content = '';
    	$.each(data.events, function(ind, val){
    		content += '<p style="background: #18457c;color: white;padding: 12px;">Début ('+val.start.substr(0,10)+') A ('+val.start.substr(11,5)+') </br>';
    		content += 'Fin ('+val.end.substr(0,10)+') A ('+val.end.substr(11,5)+') </p> ';
    	});
    	content += 'statut demande ('+data.request_state+')';
    	div.find("p.date_creneau").append(content);
    }
    function on_video_module_send_link_click(e){
    	e.preventDefault();
    	var datas = {}
    	datas.msg = $("#video-modal").find('input[name="msg"]').val();
    	datas.url = $("#video-modal").find('input[name="video"]').val();
    	console.log(datas);
    	$.ajax({
    		type: "POST",
    		url: "/module_video",
    		data: datas,
    		success: function(obj){
    			console.log(obj);
    			update_front_with_msg(obj, "msg-video");
				if (!obj.success[0])
					update_front_with_errors(obj.errors);
				else{
					/*Emmistion de socket*/
                    console.log("vidéo enregistré !" +userId);
                    var video = {
                       	type_m : obj.type_v,
                        path: obj.path,
                        user_receiver : user_receiv,
                        txt : obj.msg
                    }
                    //console.log(song);
                    socket.emit('sendchat', video, userId, user_receiv, null);
				}
    		}
    	})
    }
    function on_socket_update_service_front(data){
    	var content = '';
    	var select = $("#devis-modal select[name='services']");
    	//console.log('updateservicefront');
    	//console.log(select);
    	$.each(data, function (ind, val){
    		content += '<option value="'+val.id_service+'">'+val.nom_service+'</option>';
    	});
    	//console.log(content);
    	select.append(content);
    	select.selectpicker('refresh');
    }
    function on_devis_module_send_link_click(e){
    	e.preventDefault();
    	var datas = {};
    	if (user.type == 4){
	    	var input = $("#devis-modal input[name='msg']");
	    	var select = $("#devis-modal select[name='services']");
	    	datas.msg = input.val();
	    	datas.services = select.val();
	    	datas.sender = userId;
	    	datas.receiver = user_receiv.id_coresp;
	    	datas.room = roomDisplay;
	    	//console.log(datas);
	    	$.ajax({
	    		type: "POST",
	    		url: "/devis-request",
	    		data: datas,
	    		success: function(data){
	    			console.log(data);
	    			update_front_with_msg(data, "msg-devis");
					if (!data.success[0])
						update_front_with_errors(data.errors);
					else{
						//Emmistion de socket
	                    console.log("demende enregistré !" +userId);
	                    var devis_request = {
	                       	type_m : data.type_d,
	                        txt : data.msg,
	                        created: data.created,
	                        id_m: data.id_message,
	                        servs: data.result.servs
	                    }
	                    //console.log(devis_request);
	                    socket.emit('sendchat', devis_request, userId, user_receiv, null);
	                    //$('#chat-messages').empty();
	                    //socket.emit('list_msg', roomDisplay, user_receiv, user.type);
					}
	    		}
	    	});
	    }
    }
    function on_socket_update_servicestypemessage(data){
    	console.log("services_type_message");
    	console.log(data);
    	var div = $("div[id-message='"+data.id_m+"']");
    	div.find("p.services").empty();
    	var content = '';
    	$.each(data.servs, function(ind, val){
    		content += '('+val.libelle+') / ';
    	});
    	div.find("p.services").append(content);
    }
    function on_socket_update_contactstypemessage(data){
    	console.log("contacts_type_message");
    	console.log(data);
    	var div = $("div[id-message='"+data.id_m+"']");
    	div.find("p.user").empty();
    	var content = '';
    	content += 'nom ('+data.user_request_info.nom+') / prénom ('+data.user_request_info.prenom+') / type ('+data.user_request_info.type+') / id_temporisation ('+data.id_temp+')';
    	content += 'statut de la demande ('+data.request_state+')';
    	div.find("p.user").append(content);
    }
    function get_events(hours, datePickerValTab){
	var start, end, datas = {};
	datas.events = [];
	var timeIndice = -1.0;
	var donn = {};
	$.each(hours, function(ind){
		var hour = $(this).text();
		if (parseInt(hour) == hour){
			if (timeIndice == parseInt(hour)){
				//Ne rien faire
			}else{
				if (timeIndice == -1.0 || timeIndice != parseInt(timeIndice)){
					if (donn.start !== undefined && donn.end === undefined){
						var tabTimeIndice = timeIndice.toString().split(".");
						end = datePickerValTab[2] + "-" +datePickerValTab[1]+ "-" +datePickerValTab[0] + "T" + put_in_n_digits_hours(tabTimeIndice[0], 2) + ":" + put_in_n_digits_minutes(tabTimeIndice[1], 2)+":00";
						donn.end = end;
						datas.events.push(donn);
						donn = {}
					}
					start = datePickerValTab[2] + "-" +datePickerValTab[1]+ "-" +datePickerValTab[0] + "T" + put_in_n_digits_hours(hour, 2) + ":00:00";
					donn.start = start;
				}else{

					end = datePickerValTab[2] + "-" +datePickerValTab[1]+ "-" +datePickerValTab[0] + "T" + put_in_n_digits_hours(parseInt(timeIndice), 2) + ":00:00";
					donn.end = end;
					datas.events.push(donn);
					donn = {}
					start = datePickerValTab[2] + "-" +datePickerValTab[1]+ "-" +datePickerValTab[0] + "T" + put_in_n_digits_hours(hour, 2) + ":00:00";
					donn.start = start;
				}
			}
			if (ind == hours.length - 1){
				if (donn.end === undefined && donn.start !== undefined){
					end = datePickerValTab[2] + "-" +datePickerValTab[1]+ "-" +datePickerValTab[0] + "T" + put_in_n_digits_hours(parseInt(hour) + 1, 2) + ":00:00";
					donn.end = end;
					datas.events.push(donn);
				}
			}
			timeIndice = parseInt(hour) + 1;
		}
		else{
			var tabH = hour.toString().split(".");
			var tabH_end = parseFloat(hour) + 1;
			tabH_end = tabH_end.toString().split(".");
			//console.log(hour);
			//console.log(tabH_end);
			console.log("time indice "+timeIndice+" hour "+parseFloat(hour));
			if (timeIndice != parseFloat(hour)){
				if (timeIndice == -1.0 || timeIndice == parseInt(timeIndice)){
					//console.log(donn);
					if (donn.start !== undefined && donn.end === undefined){
						end = datePickerValTab[2] + "-" +datePickerValTab[1]+ "-" +datePickerValTab[0] + "T" + put_in_n_digits_hours(timeIndice, 2) + ":00:00";
						donn.end = end;
						datas.events.push(donn);
						donn = {}
					}
					start = datePickerValTab[2] + "-" +datePickerValTab[1]+ "-" +datePickerValTab[0] + "T" + put_in_n_digits_hours(tabH[0], 2) + ":" +
							put_in_n_digits_minutes(tabH[1], 2)+":00";
					donn.start = start;
				}else{
					var tabTimeIndice = timeIndice.toString().split(".");
					end = datePickerValTab[2] + "-" +datePickerValTab[1]+ "-" +datePickerValTab[0] + "T" + put_in_n_digits_hours(tabTimeIndice[0], 2) + ":" + put_in_n_digits_minutes(tabTimeIndice[1], 2)+":00";
					donn.end = end;
					datas.events.push(donn);
					donn = {}
					start = datePickerValTab[2] + "-" +datePickerValTab[1]+ "-" +datePickerValTab[0] + "T" + put_in_n_digits_hours(tabH[0], 2) + ":" +
							put_in_n_digits_minutes(tabH[1], 2)+":00";
					donn.start = start;
				}
			}
			if (ind == hours.length - 1){
				console.log(donn);
				if (donn.end === undefined && donn.start !== undefined){
					end = datePickerValTab[2] + "-" +datePickerValTab[1]+ "-" +datePickerValTab[0] + "T" + put_in_n_digits_hours(tabH_end[0], 2) + ":" + put_in_n_digits_minutes(tabH_end[1], 2)+":00";
					donn.end = end;
					datas.events.push(donn);
				}
			}
			timeIndice = parseFloat(hour) + 1;
		}
	})
	return (datas);
}
function put_in_n_digits_hours(ref, n){
	var i = 0, res = "";
	n = parseInt(n);
	if (ref.toString().length < n){
		for (i; i < (n - ref.toString().length); i++){
				res += "0";
		}
		for (i=0; i < ref.toString().length; i++)
			res += ref.toString()[i];
	}
	else if (ref.toString().length == n){
		res = ref;
	}
	return (res);
}
function put_in_n_digits_minutes(ref, n){
	var i = 0, res = "";
	n = parseInt(n);
	//console.log(ref);
	if (ref.toString().length < n){
		for (i; i < ref.toString().length; i++){
				res += ref.toString()[i];
		}
		for (i; i < n; i++)
			res += "0";
	}
	else if (ref.toString().length == n){
		res = ref;
	}
	return (res);
}
    var song_module_send_link = $("#song_up");
    var video_module_send_link = $("#video_up");
    var devis_module_send_link = $("#devis-send");
    var input_file_ghost = $("[name='uploaded_file']");
    var input_text = $("[name='song']");
    input_text.css("cursor", "pointer");
    var form_song = $("form.upload");
    var socket = io.connect();
    var roomDisplay = null;
    var iframe_cal1 = $(".cal")[0].contentDocument ? $(".cal")[0].contentDocument : $(".cal")[0].contentWindow.document;
    var iframe_cal2 = $(".cal")[1].contentDocument ? $(".cal")[1].contentDocument : $(".cal")[1].contentWindow.document;
    //console.log($("a.booking-chat"));
    var check_in = $("a.booking-chat");
    var meet_up = $("a.meet-up-chat");
    //$(document).on("click", ".cal .timeSelect", on_click_dispo);
    check_in.on("click", on_reservation_link_click);
    meet_up.on("click", on_reservation_link_click);
    form_song.on("submit", on_form_song_submit);
    input_file_ghost.on("change", on_input_file_ghost_change);
    input_text.on("mousedown", on_input_text_mousedown);
    song_module_send_link.on("click", on_song_module_send_link_click);
    video_module_send_link.on("click", on_video_module_send_link_click);
    devis_module_send_link.on("click", on_devis_module_send_link_click);
	socket.on('updaterooms', on_socket_update_rooms);
	socket.on('connect', on_socket_connect);
	socket.on('updatechat', on_socket_updatechat);
	socket.on('updatepreview', on_socket_updatepreview);
	socket.on('update_eventstypemessage', on_socket_update_eventstypemessage);
	socket.on('updateservicesfront', on_socket_update_service_front);
	socket.on('update_servicestypemessage', on_socket_update_servicestypemessage);
	socket.on('update_contactstypemessage', on_socket_update_contactstypemessage);
	$('#sendmessage button#send').on("click", on_msg_send_click);
	$('#sendmessage button#send').on("keypress", on_msg_send_keypress);
	var user_receiv = {};
  	var preloadbg = document.createElement("img");
  	var session = JSON.parse(sessionStorage.getItem('session'));
	//sessionStorage.clear();
	console.log(session);
	var user = null;
	var userId = null;
	var page = null;
	if (session != null && session.user != undefined){
		user = session.user;
		userId = user.id;
		page = session.page;
	}
  	preloadbg.src = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/timeline1.png";

// FONCTION D'INSERTION DE TEXTE (MODIFICATION DU DOM)//
	var actions = {};
	actions.audio = [], actions.video = [], actions.rdv = [],
	actions.booking = [], actions.devis = [], actions.paiement = [],
	actions.texte = [], actions.devis_request = [], actions.contactArt = [],
	actions.contactPro = [];
	actions.texte.push(function (data){
		var ret = '<div class="message" id-message="'+data.id_m+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><div class="bubble">'+data.txt+'<div class="corner"></div><span>'+data.created+'</span></div></div>';
		return (ret);
	}, function (data){
		var ret = '<div class="message right" id-message="'+data.id_m+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><div class="bubble">'+data.txt+'<div class="corner"></div><span>'+data.created+'</span></div></div>';
		return (ret);
	});
	actions.audio.push(function (data){
		//console.log(data);
		var ret = '<div class="message" id-message="'+data.id_m+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><div class="bubble"><div class="card-chat"><audio src="'+data.path+'" style="width:100%;" controls></audio><span>'+data.created+'</span></div></div></div>';
		return (ret);
	}, function (data){
		//console.log(data);
		var ret = '<div class="message right" id-message="'+data.id_m+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><div class="bubble"><div class="card-chat"><audio src="'+data.path+'" style="width:100%;" controls></audio><span>'+data.created+'</span></div></div></div>';
		return (ret);
	});
	actions.rdv.push(function (data){
		//console.log(data);
		var ret = '<div class="message" id-message="'+data.id_m+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><div class="bubble"><div class="card-chat"><h3>Demande de rendez-vous</h3><p class="date_creneau">'+data.txt+'';
		$.each(data.events, function(ind, val){
			ret += '<p style="background: #18457c;color: white;padding: 12px;">Début ('+val.start.substr(0,10)+') A ('+val.start.substr(11,5)+') </br>';
			ret += 'Fin ('+val.end.substr(0,10)+') A ('+val.end.substr(11,5)+') </p> ';
		});
		ret += 'statut de la demande ('+data.request_state+')';
		ret += '</p><div class="div-submi"><a href="#" class="btn-refus">refuser</a><a href="#" class="btn-accept">accepter</a></div></div><div class="corner"></div><span>'+data.created+'</span></div></div>';
		return (ret);
	}, function (data){
		//console.log(data);
		var ret = '<div class="message right" id-message="'+data.id_m+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><div class="bubble"><div class="card-chat"><h3>Demande de rendez-vous</h3><p class="date_creneau">'+data.txt+'';
		$.each(data.events, function(ind, val){
			ret += '<p style="background: #18457c;color: white;padding: 12px;">Début ('+val.start.substr(0,10)+') A ('+val.start.substr(11,5)+') </br>';
			ret += 'Fin ('+val.end.substr(0,10)+') A ('+val.end.substr(11,5)+') </p> ';
		});
		ret += 'statut de la demande ('+data.request_state+')';
		ret += '</p><div class="div-submi"><a href="#" class="btn-refus">refuser</a><a href="#" class="btn-accept">accepter</a></div></div><div class="corner"></div><span>'+data.created+'</span></div></div>';
		return (ret);
	});
	actions.booking.push(function (data){
		//console.log(data);
		var ret = '<div class="message" id-message="'+data.id_m+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><div class="bubble"><div class="card-chat"><h3>Demande de booking</h3><p class="date_creneau">'+data.txt+'';
		$.each(data.events, function(ind, val){
			ret += '<p style="background: #18457c;color: white;padding: 12px;">Début ('+val.start.substr(0,10)+') A ('+val.start.substr(11,5)+') </br>';
			ret += 'Fin ('+val.end.substr(0,10)+') A ('+val.end.substr(11,5)+') </p> ';
		});
		ret += 'statut de la demande ('+data.request_state+')';
		ret += '</p><div class="div-submi"><a href="#" class="btn-refus">refuser</a><a href="#" class="btn-accept">accepter</a></div></div><div class="corner"></div><span>'+data.created+'</span></div></div>';
		return (ret);
	}, function (data){
		//console.log(data);
		var ret = '<div class="message right" id-message="'+data.id_m+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><div class="bubble"><div class="card-chat"><h3>Demande de booking</h3><p class="date_creneau">'+data.txt+'';
		$.each(data.events, function(ind, val){
			ret += '<p style="background: #18457c;color: white;padding: 12px;">Début ('+val.start.substr(0,10)+') A ('+val.start.substr(11,5)+') </br>';
			ret += 'Fin ('+val.end.substr(0,10)+') A ('+val.end.substr(11,5)+') </p> ';
		});
		ret += 'statut de la demande ('+data.request_state+')';
		ret += '</p><div class="div-submi"><a href="#" class="btn-refus">refuser</a><a href="#" class="btn-accept">accepter</a></div></div><div class="corner"></div><span>'+data.created+'</span></div></div>';
		return (ret);
	});
	actions.video.push(function (data){
		//console.log(data);
		var ret = '<div class="message" id-message="'+data.id_m+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><div class="bubble"><div class="card-chat"><iframe class="picture" src="'+data.path+'" frameborder="0" allowfullscreen></iframe><div class="navigation"><p style="position:relative;text-align:center;top:27%;">'+data.txt+'</p></div></div><div class="corner"></div><span>'+data.created+'</span></div></div>';
		return (ret);
	}, function (data){
		//console.log(data);
		var ret = '<div class="message right" id-message="'+data.id_m+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><div class="bubble"><div class="card-chat"><iframe class="picture" src="'+data.path+'" frameborder="0" allowfullscreen></iframe><div class="navigation"><p style="position:relative;text-align:center;top:27%;">'+data.txt+'</p></div></div><div class="corner"></div><span>'+data.created+'</span></div></div>';
		return (ret);
	});
	actions.devis_request.push(function (data){
		//console.log(data);
		var ret = '<div class="message" id-message="'+data.id_m+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><div class="bubble">Objet : '+data.txt+' / Demande de devis pour les services : <p class="services">';
		$.each(data.servs, function(ind, val){
			ret += '('+val.libelle+') / ';
		});
		ret += '</p><div class="corner"></div><span>'+data.created+'</span></div></div>';
		return (ret);
	}, function (data){
		//console.log(data);
		var ret = '<div class="message right" id-message="'+data.id_m+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><div class="bubble">Objet : '+data.txt+' / Demande de devis pour les services : <p class="services">';
		$.each(data.servs, function(ind, val){
			ret += '('+val.libelle+') / ';
		});
		ret += '</p><div class="corner"></div><span>'+data.created+'</span></div></div>';
		return (ret);
	});
	actions.contactArt.push(function (data){
		//console.log(data);
		var ret = '<div class="message" id-message="'+data.id_m+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><div class="bubble">Objet : '+data.txt+' // Détails : <p class="user">';
		if (data.user_request_info != null){
			ret += 'nom ('+data.user_request_info.nom+') / prénom ('+data.user_request_info.prenom+') / type ('+data.user_request_info.type+') / id_temporisation ('+data.id_temp+')';
		}
		ret += 'statut de la demande ('+data.request_state+')';
		ret += '</p><div class="corner"></div><span>'+data.created+'</span></div></div>';
		return (ret);
	}, function (data){
		//console.log(data);
		var ret = '<div class="message right" id-message="'+data.id_m+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><div class="bubble">Objet : '+data.txt+' // Détails : <p class="user">';
		if (data.user_request_info != null){
			ret += 'nom ('+data.user_request_info.nom+') / prénom ('+data.user_request_info.prenom+') / type ('+data.user_request_info.type+') / id_temporisation ('+data.id_temp+')';
		}
		ret += 'statut de la demande ('+data.request_state+')';
		ret += '</p><div class="corner"></div><span>'+data.created+'</span></div></div>';
		return (ret);
	});
	actions.contactPro.push(function (data){
		//console.log(data);
		var ret = '<div class="message" id-message="'+data.id_m+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><div class="bubble">Objet : '+data.txt+' // Détails : <p class="user">';
		if (data.user_sender_info != null){
			ret += 'nom ('+data.user_sender_info.nom+') / prénom ('+data.user_sender_info.prenom+') / type ('+data.user_sender_info.type+') / id_temporisation ('+data.id_temp+')';
		}
		ret += 'statut de la demande ('+data.request_state+')';
		ret += '</p><div class="corner"></div><span>'+data.created+'</span></div></div>';
		return (ret);
	}, function (data){
		//console.log(data);
		var ret = '<div class="message right" id-message="'+data.id_m+'"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/245657/1_copy.jpg" /><div class="bubble">Objet : '+data.txt+' // Détails : <p class="user">';
		if (data.user_sender_info != null){
			ret += 'nom ('+data.user_sender_info.nom+') / prénom ('+data.user_sender_info.prenom+') / type ('+data.user_sender_info.type+') / id_temporisation ('+data.id_temp+')';
		}
		ret += 'statut de la demande ('+data.request_state+')';
		ret += '</p><div class="corner"></div><span>'+data.created+'</span></div></div>';
		return (ret);
	});
//*******************************************************************//
export {socket, get_events, switchRoom};
