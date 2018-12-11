import {update_front_with_msg, update_front_with_errors} from './front-update.js';
function updatePassword_link_click(e){
	var datas = {};
	e.preventDefault();
	datas.password = updatePassword_input.val();
    datas.confirm_password = confirm_updatePassword_input.val();

	$.ajax({
		type : "POST",
		url: "/updatePassword/"+token,
		data: datas,
		success: function (data){
            //console.log(data);
            update_front_with_msg(data, "msg-responses");
            if (!data.success[0]){
                if (data.errors !== undefined)
                    update_front_with_errors(data.errors)
            }else{
                document.location.href = "/"
            }
		}
	});
}
// function update_front_with_errors(tabErr){
// 	update_front_with_success();
// 	$.each(tabErr, function (ind, val){
// 		var elem = $("[name="+ind+"]");
// 		var title = "";
// 		//console.log(elem);
// 		elem.attr("data-toggle", "tooltip");
// 		$.each(val, function (i, v){
// 			title += "- "+v+"\n";
// 		});
// 		if (elem.is("select[name='cp']")){
// 			//console.log(elem.selectpicker());
// 			elem.selectpicker();
// 			elem.selectpicker({title: title}).selectpicker('render');
// 			var html = '';
// 			elem.html(html);
// 			elem.selectpicker("refresh");
// 		}else{
// 			elem.attr("data-title", title);
// 			elem.attr("data-original-title", title);
// 		}
// 	});
// 	$('[data-toggle="tooltip"]').tooltip('enable');
// }
// function update_front_with_msg(ret){
// 	var content = "";
// 	$.each(ret, function (ind, val){
// 		var elem = $("[data-name="+ind+"]");
// 		//console.log(elem);
// 		elem.empty();
// 		if (ind == "global_msg"){
// 			$.each(val, function (i, v){
// 				if (!ret.success[i])
// 					content += '<div class="error-box"><p style="margin:0">'+v+'</p><div class="small-triangle"></div><div class="small-icon"><i class="jfont">&#xe80f;</i></div></div>';
// 				else{
// 					content += '<div class="success-box"><p style="margin:0">'+v+'</p><div class="small-triangle"></div><div class="small-icon"><i class="jfont">&#xe816;</i></div></div>';
// 				}
// 			});
// 			elem.append(content);		
// 		}
// 	});
// 	//$('[data-toggle="tooltip"]').tooltip();
// }
// function update_front_with_success(){
// 	$('[data-toggle="tooltip"]').tooltip('disable');
// 	$.each($("[name]"), function (ind, val){
// 		var elem = $(val);
// 		if (elem.is("select")){
// 			elem.selectpicker();
// 			elem.selectpicker({title: "Sélectionner :"}).selectpicker('render');
// 			elem.selectpicker("refresh");
// 		} else{
// 			$(this).removeAttr("data-title");
// 			$(this).removeAttr("data-original-title");
// 		}
// 		$(this).removeAttr("data-toggle");
// 	});
// }
// window.onload = function() {
// 	var session_data = JSON.parse(localStorage.getItem("datas"));
// 	//console.log(session_data);
// 	//console.log(localStorage);
// 	localStorage.clear();
// 	if (session_data != null){
// 		update_front_with_msg(session_data);
// 		if (session_data.errors !== undefined){
// 			update_front_with_errors(session_data.errors);
// 		}
// 		else{
// 			update_front_with_success();
// 		}
// 	}
// }
function on_document_ready(){
	//console.log(login_link);
	updatePassword_link = $("a[data-action='password_update']");
    updatePassword_input = $("form input[name='password']");
	confirm_updatePassword_input = $("form input[name='confirm_password']");
	updatePassword_link.on("click", updatePassword_link_click);
}
var updatePassword_link = null;
var updatePassword_input = null;
var confirm_updatePassword_input = null;
var session = JSON.parse(sessionStorage.getItem('session'));
var token = null;
if (session != null){
  token = session.token;
}
$(document).on("ready", on_document_ready);
