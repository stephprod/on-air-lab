function login_link_click(e){
	var datas = {};
	e.preventDefault();
	datas.email = login_input.val();
	datas.pass = password_input.val();
	console.log(login_input);
	console.log(password_input);
	$.ajax({
		type : "POST",
		url: "/login",
		data: datas,
		success: function (data){
			console.log(data);
			if (data.errors == undefined){
				localStorage.setItem("user", JSON.stringify(data.result));
			}
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
	//$('[data-toggle="tooltip"]').tooltip();
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
	login_link = $("a[data-action='login']");
	login_input = $("#login-modal input[name='login']");
	password_input = $("#login-modal input[name='password']");
	login_link.on("click", login_link_click);
}
var login_link = null;
var login_input = null;
var password_input = null;
$(document).on("ready", on_document_ready);
