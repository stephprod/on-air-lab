import {update_front_with_msg, update_front_with_errors, update_front_with_success} from './front-update.js';
function login_link_click(e){
	var datas = {};
	e.preventDefault();
	datas.email = login_input.val();
	datas.pass = password_input.val();
	//console.log(login_input);
	//console.log(password_input);
	$.ajax({
		type : "POST",
		url: "/login",
		data: datas,
		async: false,
		success: function (data){
			// console.log("msg");
			// console.log(data);
			update_front_with_msg(data, "login-msg");
			if (data.errors !== undefined){
				update_front_with_errors(data.errors);
			}
			else{
				update_front_with_success();
				document.location.reload();
			}
		}
	});
}
/*window.onload = function() {
	var session_data = JSON.parse(localStorage.getItem("datas"));
	//console.log(session_data);
	//console.log(localStorage);
	localStorage.clear();
	if (session_data != null){
		update_front_with_msg(session_data);
		if (session_data.errors !== undefined){
			update_front_with_errors(session_data.errors);
		}
		else{
			update_front_with_success();
		}
	}
}*/
function on_document_ready(){
	//console.log(login_link);
	login_link = $("a[data-action='login']");
	login_input = $("#login-modal input[name='login']");
	password_input = $("#login-modal input[name='password']");
	login_link.on("click", login_link_click);
}
var login_link = null;
var login_input = null;
var password_input = null;
$(document).on("ready", on_document_ready);
