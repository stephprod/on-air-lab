import {update_front_with_msg, update_front_with_errors} from './front-update.js';
//import socket_manager from '../../models/socket_manager.js';
var session = JSON.parse(sessionStorage.getItem('session')), user, token, userId, dow, eventObj;
var calen = JSON.parse(sessionStorage.getItem('calendar'));
// console.log(session);
// console.log(calen);
if (session != null && session.user != undefined){
    user = session.user;
    userId = user.id;
    token = session.token;
    if (calen != null){
        dow = JSON.parse(calen.dow);
        eventObj = calen.event;
    }
}
var lundi;
var mardi;
var mercredi;
var jeudi;
var vendredi;
var samedi;
var dimanche;
var pause;

/*  className colors

className: default(transparent), important(red), chill(pink), success(green), info(blue)

*/
    
/* initialize the external events
-----------------------------------------------------------------*/

$('#external-events div.external-event').each(function() {

    // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
    // it doesn't need to have a start or end
    var eventObject = {
    title: $.trim($(this).text()) // use the element's text as the event title
    };
    
    // store the Event Object in the DOM element so we can get to it later
    var t = $(this).data('eventObject', eventObject);
    
    // make the event draggable using jQuery UI
    $(this).draggable({
    zIndex: 999,
    revert: true,      // will cause the event to go back to its
    revertDuration: 0  //  original position after the drag
    });
    
});

/* initialize the calendar
-----------------------------------------------------------------*/
var calendar =  $('#calendar').fullCalendar({
    header: {
        left: 'title',
        center: 'agendaDay,agendaWeek,month,listWeek',
        right: 'prev,next today'
    },
    slotLabelFormat:"HH:mm",
    // editable: true,
    firstDay: 1, //  1(Monday) this can be changed to 0(Sunday) for the USA system
    selectable: true,
    defaultView: 'agendaWeek',
    axisFormat: 'h:mm',
    locale: 'fr', // AJOUTER LE FICHIER LOCALS src='fullcalendar/lang-all.js
    eventLimit: true, // for all non-agenda views
    views: {
        agenda: {
            eventLimit: 4 // adjust to 6 only for agendaWeek/agendaDay
        },
    },  	
    selectHelper: true,
    selectConstraint: "businessHours",
    select: function(start, end, allDay) {
        var title = prompt('Titre de l\'évennement : ');
        if (title) {
            start = start.format();
            end = end.format();
            $.ajax({
                url: '/agenda',
                data: 'title='+ title+'&start='+ start +'&end='+ end ,
                type: "POST",
                beforeSend: function (req){
                    req.setRequestHeader("x-access-token", token);
                },
                success: function(data) {
                    //console.log(data);
                    calendar.fullCalendar('renderEvent',
                        {
                            id_event : data[4],
                            title: title,
                            start: start,
                            end: end,
                        },
                        true // make the event "stick"
                    );
                }
            });
        }
        $('#calendar').fullCalendar('unselect');
    },
    eventClick: function(event, jsEvent, view) {
        // console.log('Clicked on: ' + event.start.format()+' A : ' + event.end.format());
        // console.log('Clicked on: ' + event.title);
        // console.log('Clicked on: ' );
        // console.log(event);
        // console.log('Coordinates: ' + jsEvent.id + ',' + jsEvent.pageY);
        // console.log('Current view: ' + view.name);
        // change the day's background color just for fun
        // $(this).css('background-color', '#e9e9e9');
        var result = confirm('Êtes-vous sûr de vouloir supprimer l\'évènement ?');
        if(result){
            if (!event.expired){
                $('#calendar').fullCalendar('removeEvents', event._id);
                $.ajax({
                    url: '/drop_event_calendar',
                    data: {id_event: event.id_event, id_payment_request: event.id_payment,
                        type_transaction: event.type_transaction, price_refund: event.price,
                        id_pro: event.id_pro, id_art: event.id_artist, id_type_message:event.id_type_m},
                    type: "POST",
                    beforeSend: function(req){
                        req.setRequestHeader("x-access-token", session.token);
                    },
                    success: function(data) {
                        localStorage.setItem("datas_cal", JSON.stringify(data));
                        document.location = "/agenda";
                    }
                })
            }else{
                update_front_with_msg({success:[false], global_msg:["Evènement expiré !"]}, "calendar-msg");
            }
        }
    },
    // droppable: true, // this allows things to be dropped onto the calendar !!!
    // dragRevertDuration: 0,
    // eventDrop: function(event, date, allDay) { // this function is called when something is dropped
    
    // //retrieve the dropped element's stored Event Object
    // var originalEventObject = $(this).data('eventObject');
    
    // // we need to copy it, so that multiple events don't have a reference to the same object
    // var copiedEventObject = $.extend({}, originalEventObject);
    
    // // assign it the date that was reported
    // copiedEventObject.start = date;
    // copiedEventObject.allDay = allDay;
    // // render the event on the calendar
    // // the last `true` argument determines if the event "sticks" (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)
    
    // // is the "remove after drop" checkbox checked?
    // if ($('#drop-remove').is(':checked')) {
    //     // if so, remove the element from the "Draggable Events" list
    //     $(this).remove();
    // }
    
    // },
    eventDrop: function(event, delta, revertFunc) {
        var start = event.start.format();
        var end = event.end.format();
        alert(event.title + " déplacé à " + event.start.format());

        if (!confirm("Êtes-vous sûr du déplacement ?")) {
            revertFunc();
        }
        else{
            $.ajax({
                url: '/update_event_calendar',
                data: 'start='+ start +'&end='+ end+'&id='+ event.id_event,
                beforeSend: function(req){
                    req.setRequestHeader("x-access-token", token);
                },
                type: "POST",
                success: function(data) {
                    update_front_with_msg(data, "calendar-msg");
                    //console.log("Update de "+data.id);
                }
            });
        }
    },
    eventResize: function(event, delta, revertFunc, jsEvent, ui, view){
        var start = event.start.format();
        var end = event.end.format();
        alert(event.title + " redimentionné jusqu'à " + event.end.format());
        if (!confirm("Êtes vous sûr de ce changement ?")) {
            revertFunc();
        }
        else{
            $.ajax({
            url: '/update_event_calendar',
            data: 'start='+ start +'&end='+ end+'&id='+ event.id_event,
            beforeSend: function(req){
                req.setRequestHeader("x-access-token", token);
            },
            type: "POST",
            success: function(data) {
                update_front_with_msg(data, "calendar-msg");
                //console.log("Update de "+data.res.id);
            }
            });
        }
    },
    //A ACTIVER EN EJS
    businessHours: dow,
    events: eventObj,
    // NEED FULLCALENDAR SCHEDULER
    // resources: '/asset/content/calendar_feed.json',
    // resourceRender: function(resourceObj, $td) {
    //     $td.eq(0).find('.fc-cell-content')
    //     .append(
    //         $('<strong>(?)</strong>').popover({
    //             title: resourceObj.title,
    //             content: 'test!',
    //             trigger: 'hover',
    //             placement: 'bottom',
    //             container: 'body'
    //         })
    //     );
    // },
});
$('.datepicker input').datetimepicker({
    format : 'HH:mm',
    locale : 'fr',
    sideBySide : true,
    stepping : 30
});
//console.log($('.datepicker input').data("DateTimePicker").disable());
$('.datepicker input').on("dp.change", function(e){
    var target = $(e.target);
    var val_open = $('.datepicker input#open').val().replace(":", ".");
    var val_close =  $('.datepicker input#close').val().replace(":", ".");
    //console.log(target);
    if (target.attr("id") == "close"){
        if ($('.datepicker input#open').val() != ""){
            if (parseFloat(val_open) < parseFloat(val_close))
                $('input[type=checkbox]').removeAttr("disabled", "disabled");		
        }
    }else{
        if ($('.datepicker input#close').val() != ""){
            if (parseFloat(val_open) < parseFloat(val_close))
                $('input[type=checkbox]').removeAttr("disabled", "disabled");		
        }
    }
    //console.log("CHANGE FIRED !");
});
$('input[type=checkbox]').attr("disabled", "disabled");
$('input[type=checkbox]').change(function(e){
    if($(this).is(':checked')) {
        //console.log("Checked" +e.target.id);
        $("<p class='horaire-align' id="+e.target.id+">"+e.target.id+" : de "+$('input[name="ouverture"]').val()+" A "+$('input[name="fermeture"]').val()+"</p>").appendTo( "#dishoraire" );
        if (e.target.id == "lundi") {
            lundi = $('input[name="ouverture"]').val()+"-"+$('input[name="fermeture"]').val();
        }if (e.target.id == "mardi") {
            mardi = $('input[name="ouverture"]').val()+"-"+$('input[name="fermeture"]').val();
        }if (e.target.id == "mercredi") {
            mercredi = $('input[name="ouverture"]').val()+"-"+$('input[name="fermeture"]').val();
        }if (e.target.id == "jeudi") {
            jeudi = $('input[name="ouverture"]').val()+"-"+$('input[name="fermeture"]').val();
        }if (e.target.id == "vendredi") {
            vendredi = $('input[name="ouverture"]').val()+"-"+$('input[name="fermeture"]').val();
        }if (e.target.id == "samedi") {
            samedi = $('input[name="ouverture"]').val()+"-"+$('input[name="fermeture"]').val();
        }if (e.target.id == "dimanche") {
            dimanche = $('input[name="ouverture"]').val()+"-"+$('input[name="fermeture"]').val();
        }
    } else {
        //console.log("pas Checked" +e.target.id);
        $("p").remove("#"+e.target.id)
        if (e.target.id == "lundi") {
            lundi = null;
        }if (e.target.id == "mardi") {
            mardi = null;
        }if (e.target.id == "mercredi") {
            mercredi = null;
        }if (e.target.id == "jeudi") {
            jeudi = null;
        }if (e.target.id == "vendredi") {
            vendredi = null;
        }if (e.target.id == "samedi") {
            samedi = null;
        }if (e.target.id == "dimanche") {
            dimanche = null;
        }
    }
});
$('#dishoraire .savecal').click(function(ev){
    ev.preventDefault();
    pause = $('input[name="pausedeb"]').val()+"-"+$('input[name="pausefin"]').val();
    //console.log(lundi+" / "+mardi+" / "+mercredi+" / "+jeudi+" / "+vendredi+" / "+samedi+" / "+dimanche+" / "+pause);
        $.ajax({
            url: '/calendar_dow',
            data: 'lundi='+lundi+'&mardi='+mardi+'&mercredi='+mercredi+'&jeudi='+jeudi+'&vendredi='+vendredi+'&samedi='+samedi+'&dimanche='+dimanche+'&pause='+pause ,
            beforeSend: function(req){
                req.setRequestHeader("x-access-token", token);
            },
            type: "POST",
            success: function(data) {
                // console.log(JSON.stringify(data));
                localStorage.setItem("datas_cal", JSON.stringify(data));
                document.location = "/agenda";
            }
        });
});
window.onload = function() {
    var session_data = JSON.parse(localStorage.getItem("datas_cal"));
    // console.log(session_data);
    //console.log(localStorage);
    localStorage.clear();
    if (session_data != null){
        update_front_with_msg(session_data, "calendar-msg");
        if (session_data.errors !== undefined){
            update_front_with_errors(session_data.errors);
        }
    }
}