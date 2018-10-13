function register_link_click(e){
	var datas = {};
	e.preventDefault();
	datas.nom = last_name_input.val();
	datas.prenom = first_name_input.val();
	datas.email = login_register_input.val();
	datas.password = password_register_input.val();
	datas.confirm_password = repeat_password_input.val();
	datas.type = type_input.val();

	$.ajax({
		type : "POST",
		url: "/register",
		data: datas,
		success: function (data){
			localStorage.setItem("datas", JSON.stringify(data));
			document.location.reload();
		}
	});
}
function update_front_with_errors(tabErr){
	update_front_with_success();
	$.each(tabErr, function (ind, val){
		var elem = $("[name="+ind+"]");
		var title = "";
		//console.log(elem);
		elem.attr("data-toggle", "tooltip");
		$.each(val, function (i, v){
			title += "- "+v+"\n";
		});
		if (elem.is("select[name='cp']")){
			console.log(elem.selectpicker());
			elem.selectpicker();
			elem.selectpicker({title: title}).selectpicker('render');
			var html = '';
			elem.html(html);
			elem.selectpicker("refresh");
		}else{
			elem.attr("data-title", title);
			elem.attr("data-original-title", title);
		}
	});
	$('[data-toggle="tooltip"]').tooltip('enable');
}
function update_front_with_msg(ret){
	var content = "";
	$.each(ret, function (ind, val){
		var elem = $("[data-name="+ind+"]");
		//console.log(elem);
		elem.empty();
		if (ind == "global_msg"){
			$.each(val, function (i, v){
				if (!ret.success[i])
					content += '<div class="error-box"><p style="margin:0">'+v+'</p><div class="small-triangle"></div><div class="small-icon"><i class="jfont">&#xe80f;</i></div></div>';
				else{
					content += '<div class="success-box"><p style="margin:0">'+v+'</p><div class="small-triangle"></div><div class="small-icon"><i class="jfont">&#xe816;</i></div></div>';
				}
			});
			elem.append(content);		
		}
	});
}
function update_front_with_success(){
	$('[data-toggle="tooltip"]').tooltip('disable');
	$.each($("[name]"), function (ind, val){
		var elem = $(val);
		if (elem.is("select")){
			elem.selectpicker();
			elem.selectpicker({title: "Sélectionner :"}).selectpicker('render');
			elem.selectpicker("refresh");
		} else{
			$(this).removeAttr("data-title");
			$(this).removeAttr("data-original-title");
		}
		$(this).removeAttr("data-toggle");
	});
}
window.onload = function() {
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
}
function on_document_ready(){
	//console.log(login_link);
	register_link = $("a[data-action='register']");
	login_register_input = $("#register-modal input[name='login']");
	first_name_input = $("#register-modal input[name='first_name']");
	last_name_input = $("#register-modal input[name='last_name']");
	repeat_password_input = $("#register-modal input[name='repeat_password']");
	type_input = $("#register-modal input[name='type']:checked");
	password_register_input = $("#register-modal input[name='password']");
	register_link.on("click", register_link_click);
}

var register_link = null;
var login_register_input = null;
var first_name_input = null;
var last_name_input = null;
var repeat_password_input = null;
var type_input = null;
var password_register_input = null;
$(document).on("ready", on_document_ready);
