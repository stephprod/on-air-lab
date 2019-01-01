function update_front_with_errors(tabErr){
	//console.log(tabErr);
	update_front_with_success();
	if (tabErr !== undefined && tabErr != null){
		$.each(tabErr, function (ind, val){
			var elem = $("[name="+ind+"]");
			var title = "";
			//console.log(elem);
			elem.attr("data-toggle", "tooltip");
			$.each(val, function (i, v){
				title += "- "+v+"\n";
			});
			if (elem.is("select[name='cp']")){
				//console.log(elem.selectpicker());
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
	}
	$('[data-toggle="tooltip"]').tooltip('enable');
}
	function update_front_with_msg(ret, dataName){
		$('.global_msg').remove();
		var content = "";
		$.each(ret, function (ind, val){
			var elem = $("."+dataName);
			console.log(elem);
			//elem.after();
			if (ind == "global_msg"){
				content += '<div class="global_msg">';
				$.each(val, function (i, v){
					if (!ret.success[i])
						content += '<div class="error-box"><p style="margin:0;">'+v+'</p><div class="small-triangle"></div><div class="small-icon"><i class="jfont">&#xe80f;</i></div></div>';
					else{
						content += '<div class="success-box"><p style="margin:0;">'+v+'</p><div class="small-triangle"></div><div class="small-icon"><i class="jfont">&#xe816;</i></div></div>';
					}
				});
				content += '</div>';
				console.log(content);
				elem.after(content);		
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
export {update_front_with_msg, 
	update_front_with_errors, 
	update_front_with_success};