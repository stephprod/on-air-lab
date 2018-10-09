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
export {get_events};