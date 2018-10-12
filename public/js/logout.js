import {update_front_with_msg, update_front_with_errors, update_front_with_success} from './front-update.js';
function logout_link_click(e){
	var datas = {};
	e.preventDefault();
	datas.id_user = user.id;
	//datas.pass = password_input.val();
	//console.log(datas);
	$.ajax({
		type : "POST",
		url: "/logout",
		data: datas,
		success: function (data){
			//console.log(data);
			update_front_with_msg(data, "logout-msg");
			if (data.errors !== undefined){
				update_front_with_errors(data.errors);
			}
			else{
				update_front_with_success();
			}
			document.location.reload();
		}
	});
}
function on_document_ready(){
	//console.log(login_link);
	logout_link = $("a[data-action='logout']");
	logout_link.on("click", logout_link_click);
}
var logout_link = null;
var session = JSON.parse(sessionStorage.getItem('session'));
//console.log(session);
var user = null;
sessionStorage.clear();
//console.log(user);
var userId = null;
var page = null;
if (session != null){
	user = session.user;
	if (user != null && user.id != null && user.id != "null"){
		userId = user.id;
	}
}
$(document).on("ready", on_document_ready);
