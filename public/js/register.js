import {update_front_with_msg, update_front_with_errors} from './front-update.js';
function register_link_click(e){
	var datas = {};
	e.preventDefault();
	set_up_vars();
	datas.nom = last_name_input.val();
	datas.prenom = first_name_input.val();
	datas.email = login_register_input.val();
	datas.password = password_register_input.val();
	datas.confirm_password = repeat_password_input.val();
	datas.type = type_input.val();
	//console.log(datas);
	$.ajax({
		type : "POST",
		url: "/register",
		data: datas,
		success: function (data){
			update_front_with_msg(data, "register-msg");
			if (!data.success[0] && data.errors !== undefined)
				update_front_with_errors(data.errors)
			// else if (data.success[0])
			// 	document.location.href = "/";
		}
	});
}
function on_document_ready(){
	//console.log(login_link);
	set_up_vars();
	register_link.on("click", register_link_click);
}
function set_up_vars(){
	register_link = $("a[data-action='register']");
	login_register_input = $("#register-modal input[name='login']");
	first_name_input = $("#register-modal input[name='first_name']");
	last_name_input = $("#register-modal input[name='last_name']");
	repeat_password_input = $("#register-modal input[name='confirm_password']");
	type_input = $("#register-modal input[name='type']:checked");
	password_register_input = $("#register-modal input[name='password']");
}

var register_link = null;
var login_register_input = null;
var first_name_input = null;
var last_name_input = null;
var repeat_password_input = null;
var type_input = null;
var password_register_input = null;
$(document).on("ready", on_document_ready);
