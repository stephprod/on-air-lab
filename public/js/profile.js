*-*import {socket, get_events, switchRoom} from './chat.js';
function on_form_contact_submit(e){
	e.preventDefault();
	var that = $(this);
	 $.ajax({
      'type' : that.attr('method'),
      'url' : that.attr('action'),
      'data': that.serializeArray(),
      'success': function(data) {
      	//console.log(data);
      	//console.log(user);
		update_front_with_msg(data, "msg-contact");
		if (data.success[0]){
			//Emission de la socket
			console.log("demande envoyé !" +userId);
			var user_request = {}, user_sender = {};
			user_sender.id = user.id;
			user_sender.nom = user.nom;
			user_sender.prenom = user.prenom;
			user_sender.type = user.type;
			user_request.id = user_receiv.id_coresp;
			user_request.nom = user_receiv.nom;
			user_request.prenom = user_receiv.prenom;
			user_request.type = user_receiv.type;
            var contact = {
                type_m : data.result.type_d,
                user_request_info : user_request,
                user_sender_info : user_sender,
                txt : data.msg,
                created: data.created,
                id_m: data.result.id_message,
                id_temp: data.result.id_t,
                request_state: 0
            }
            //console.log(contact);
            if (user.id != null && user.id != "null"){
            	//console.log(user);
            	switchRoom(1, 1, "Admin", "Admin", 1, user);
            	socket.emit('sendchat', contact, user.id, user_receiv, "iframe-chat");
            }
        }else{
        	if (data.result.room !== undefined){
        		roomDisplay = data.result.room;
        	}
        }
      }
	});
}

function on_reservation_link_click(e){
	e.preventDefault();
	var iframe = $(this).data("frame") == "1" ? iframe_cal1 : iframe_cal2 ;
	var datePickerVal = $(iframe).find(".datepicker input").val().replace(new RegExp("/", "g"), "-");
	var datePickerValTab = datePickerVal.split("-");
	var hours = $(iframe).find("#selectHours .sel");
	var datas = {};
	datas = get_events(hours, datePickerValTab);
	datas.id_pro = session.id_u;
	datas.id_art = userId;
	datas.user_receiv = session.id_u;
	datas.user_sender = userId;
	datas.room = roomDisplay;
	if (roomDisplay != null){
		if ($(this).data("frame") == "1"){
			datas.from = "rdv";
			datas.title = "event-meet";
		}
		else{ 
			datas.from = "booking";
			datas.title = "event-work";
		}
		//console.log(datas);
		$.ajax({
			type: "POST",
			url: "/check-in",
			data: datas,
			success: function (data){
				//console.log(data);
				update_front_with_msg(data, "msg-contact");
				if (data.success[0]){
					//Emission de la socket
					console.log("demande envoyé !" +userId);
					/*var user_request = {}
					if (user_receiv.type != 4){
						user_request.id = user.id;
						user_request.nom = user.nom;
						user_request.prenom = user.prenom;
						user_request.type = user.type;
					}else{
						user_request.id = user.id;
						user_request.nom = user.nom;
						user_request.prenom = user.prenom;
						user_request.type = user.type;
					}*/
		            var rdv = {
		                type_m : data.result.type_r,
		                user_receiver : user_receiv,
		                txt : data.msg,
		                events: datas.events,
		                id_disp: data.result.id_dispos,
		                id_temp: data.result.id_t,
		                created: data.created,
		                request_state : 0
		            }
		            //console.log(contact);
		            switchRoom(roomDisplay, user_receiv.id_coresp, user_receiv.nom, user_receiv.prenom, user_receiv.type, user);
		            socket.emit('sendchat', rdv, userId, user_receiv, "iframe-chat");
				}
		    }
		});
	}else{
		var data = {};
		data.success = [false];
		data.global_msg = ["Aucune room n'a été créée entre les users !"];
		update_front_with_msg(data, "msg-contact");
		console.log("Aucune room existe entre les users !");
	}
}
var form = $("form#contact");
form.on("submit", on_form_contact_submit);
var iframe_cal1 = $(".cal")[0].contentDocument ? $(".cal")[0].contentDocument : $(".cal")[0].contentWindow.document;
var iframe_cal2 = $(".cal")[1].contentDocument ? $(".cal")[1].contentDocument : $(".cal")[1].contentWindow.document;
var check_in = $("a#booking");
var meet_up = $("a#meet-up");
var session = JSON.parse(sessionStorage.getItem('session'));
//sessionStorage.clear();
//console.log(session);
var roomDisplay = JSON.parse(sessionStorage.getItem('room'));
var user_receiv = JSON.parse(sessionStorage.getItem('user_receiv'));
console.log(session);
console.log(user_receiv);
var user = null;
var userId = null;
var page = null;
if (session != null && session.user != undefined){
	user = session.user;
	userId = user.id;
	page = session.page;
}
//console.log($(".cal"));
/*$(iframe_cal1).on("click", ".timeSelect", on_click_dispo);
$(iframe_cal2).on("click", ".timeSelect", on_click_dispo);*/
check_in.on("click", on_reservation_link_click);
meet_up.on("click", on_reservation_link_click);
//export {get_events};
sessionStorage.clear();