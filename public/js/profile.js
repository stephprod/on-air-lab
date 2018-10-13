//import {socket, get_events, switchRoom} from './chat.js';
import {update_front_with_msg, update_front_with_errors, update_front_with_success} from './front-update.js';
/*import {get_events} from './events.js';
import {socket, switchRoom} from './socket_modules.js';*/
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
			//console.log("time indice "+timeIndice+" hour "+parseFloat(hour));
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
				//console.log(donn);
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
function updateUserReceived(data){
    user_receiv = data;
}
function switchRoom(room, id_coresp, nom, prenom, type, usr){
	//console.log("switch room");
	//console.log(usr);
	var coresp= {};
    coresp.nom = nom;
    coresp.prenom = prenom;
    coresp.id_coresp = id_coresp;
    coresp.type = type;
    //console.log(coresp);
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
			//console.log("demande envoyé !" +userId);
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
	console.log("resa click !");
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
var socket = io.connect();
var session = JSON.parse(sessionStorage.getItem('session'));
//sessionStorage.clear();
//console.log(session);
var roomDisplay = JSON.parse(sessionStorage.getItem('room'));
var user_receiv = JSON.parse(sessionStorage.getItem('user_receiv'));
//console.log(user_receiv);
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
$(document).on("click", "a#booking, a#meet-up", on_reservation_link_click);
//check_in.on("click", on_reservation_link_click);
//meet_up.on("click", on_reservation_link_click);
//export {get_events};
//sessionStorage.clear();
