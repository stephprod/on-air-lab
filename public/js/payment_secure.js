//import {update_front_with_msg} from './front-update.js';
function form_payment(data){
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
      image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
      locale: 'auto',
      allowRememberMe: false,
      email: data.email,
    }); 
    // Open Checkout with further options:
    handler.open({
      name: 'Stripe.com',
      description: data.desc,
      amount: price,
      currency: currency,
      token: handleToken
    }); 
    // Close Checkout on page navigation:
    // $(window).on('popstate', function() {
    //   handler.close();
    // });
    //e.preventDefault(); 
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
            var ret = {};
            if (result.error) {
                // Display error.message in your UI.
                ret.success = [false];
                ret.global_msg = [result.error.message];
            } else {
                // The payment has succeeded. Display a success message.
                ret.success = [true];
                ret.global_msg = ["Paiement effectué avec succès "];
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
                    content += '<div class="error-box margin-top-30"><p>'+v+'</p><div class="small-triangle"></div><div class="small-icon"><i class="jfont">&#xe80f;</i></div></div>';
                else{
                    content += '<div class="success-box margin-top-30"><p>'+v+'</p><div class="small-triangle"></div><div class="small-icon"><i class="jfont">&#xe816;</i></div></div>';
                }
            });
            content += '</div>';
            elem.after(content);		
        }
    });
    //$('[data-toggle="tooltip"]').tooltip();
};