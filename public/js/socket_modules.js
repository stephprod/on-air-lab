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
var socket = io.connect();
//console.log(io);
export {socket, switchRoom};