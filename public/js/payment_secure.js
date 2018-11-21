function form_payment(data){
    console.log(data);
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
      token: function(token) {
        tok = token;
        stripe.createSource({
          type: 'three_d_secure',
          amount: price,
          currency: "eur",
          three_d_secure: {
            card: token.card.id
          },
          owner: {name: "Stripe.com", email: data.email},
          redirect: {
            return_url: "http://localhost:4000/payment-module/"+data.id
          }
        }).then(stripe3DSecureResponseHandler);
      }
    }); 
    // Open Checkout with further options:
    handler.open({
      name: 'Stripe.com',
      description: data.desc,
      amount: price,
      currency: currency
    }); 
    // Close Checkout on page navigation:
    // $(window).on('popstate', function() {
    //   handler.close();
    // });
    //e.preventDefault(); 
    // function stripeCardResponseHandler(status, response) {
    //   var returnURL = "http://localhost:4000/payment-module/"+data.id;
    //   if (response.error) {
    //     var message = response.error.message;
    //     displayResult("Unexpected card source creation response status: " + status + ". Error: " + message);
    //     return;
    //   }
      
    //   // check if the card supports 3DS
    //   if (response.card.three_d_secure == 'not_supported') {
    //       //displayResult("This card does not support 3D Secure.");
    //       console.log(response);
    //       return;
    //   }
    // }
    
    function stripe3DSecureResponseHandler(response) {
        var src ;
        console.log(response);
        if (response.error) {
            var message = response.error.message;
            displayResult("Unexpected 3DS source creation response status: " + status + ". Error: " + message);
            return;
        }
        
        // check the 3DS source's status
        if (response.source.status == 'chargeable') {
            displayResult("This card does not support 3D Secure authentication, but liability will be shifted to the card issuer."); 
            // src = {source: response.source.id};          
            // parent.document.location.href = response.source.redirect.return_url +'?'+ serialize(src);
            // return;
        } else if (response.source.three_d_secure.three_d_secure == 'not_supported') {
            displayResult("Unsupported 3D Secure - Normal Payment : " + response.source.status);
            console.log(response.source);
            stripe.createSource({
                type: 'card',
                amount: price,
                currency: "eur",
                token: tok.id,
                owner: {name: "Stripe.com", email: data.email}
              }).then((res) => {
                src = {source: res.source.id};
                console.log(res);
                parent.document.location.href = response.source.redirect.return_url + '?' + serialize(src);
              });
            //parent.document.location.href = response.source.redirect.return_url + '?' + serialize(src);
            return;
        }
        else if (response.source.status != 'pending') {
            displayResult("Unexpected 3D Secure status: " + response.source.status);
            return;
        } 
        parent.document.location.href = response.source.redirect.url
    }
}
function displayProcessing() {
    // document.getElementById("processing").style.display = 'block';
    // document.getElementById("charge-form").style.display = 'none';
    // document.getElementById("result").style.display = 'none';
    console.log("Processing... !");
}

function displayResult(resultText) {
    // document.getElementById("processing").style.display = 'none';
    // document.getElementById("charge-form").style.display = 'block';
    // document.getElementById("result").style.display = 'block';
    // document.getElementById("result").innerText = resultText;
    console.log(resultText);
}
function serialize(obj, prefix) {
var str = [],
    p;
for (p in obj) {
    if (obj.hasOwnProperty(p)) {
    var k = prefix ? prefix + "[" + p + "]" : p,
        v = obj[p];
    str.push((v !== null && typeof v === "object") ?
        serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
}
return str.join("&");
}