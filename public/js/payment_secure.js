//import {update_front_with_msg} from './front-update.js';
var socket = io.connect();
var iframe;
var session = JSON.parse(sessionStorage.getItem('session'));
//console.log(session);
function form_payment(data, glob_datas){
    //console.log(data);
    var stripePublishableKey = 'pk_test_L0T2zWeT0uLcyhZCD1Nfqzx2';
    var currency = 'eur';
    var price = parseFloat(data.price) * 100;
    var tok;
    var stripe = Stripe(stripePublishableKey, {
      betas: ['payment_intent_beta_3']
    });
     // Create Checkout's handler
    var handler = StripeCheckout.configure({
      key: stripePublishableKey,
      image: data.img,
      locale: 'auto',
      allowRememberMe: true,
      email: data.email,
    }); 
    // Open Checkout with further options:
    handler.open({
      name: 'Label-OnAir',
      description: data.desc,
      amount: price,
      currency: currency,
      token: handleToken
    }); 
    function handleToken(token){
        tok = token;
        //console.log(token);
        stripe.handleCardPayment(
            data.intent,
            {
                source_data: {
                    owner: {
                        name: data.prenom+" "+data.nom,
                        email: data.email,
                    },
                    token: tok.id,
                },
            }
        ).then(function(result) {
            //console.log(result);
            iframe = $("iframe[src='/chat']")[0] !== undefined ? $("iframe[src='/chat']")[0].contentDocument : null;
            var ret = {};
            if (result.error) {
                // Display error.message in your UI.
                ret.success = [false];
                ret.global_msg = [result.error.message];
            } else {
                // The payment has succeeded. Display a success message.
                ret.success = [true];
                ret.global_msg = ["Paiement effectué avec succès "];
                $.ajax({
                    type: "POST",
                    url: "/action-in-module",
                    data: glob_datas,
                    beforeSend: function (req){
                        req.setRequestHeader("x-access-token", session.token);
                    },
                    success: function (data){
                        console.log(data);
                        if (data.success[0]){
                            socket.emit("sendNotif", data.notif);
                            const content = 'demande acceptée !';
                            $("div[data-id-type-message='"+glob_datas.id_type_message+"']", iframe).find("div.card-chat div.div-submi").empty();
                            $("div[data-id-type-message='"+glob_datas.id_type_message+"']", iframe).find("div.card-chat div.div-submi").append(content);
                        }
                    }
                })
            }
            //console.log(ret);
            //return ret;
            updateFront(ret, "msg-payment-valid")
        });
    }
}
var updateFront = function (ret, dataName){
    $('.global_msg').remove();
    //console.log("Update front !");
    var content = "";
    $.each(ret, function (ind, val){
        var elem = $("."+dataName);
        //console.log(elem);
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
            elem.after(content);		
        }
    });
};