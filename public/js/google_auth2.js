//import {update_front_with_msg, update_front_with_errors, update_front_with_success} from './front-update.js';
var GoogleAuth;
var SCOPE = "https://www.googleapis.com/auth/drive.metadata.readonly";
var API_KEY = "AIzaSyC-VD-HkO3G2RQdJVjkOIXFATSH4p3OrwU";
var CLIENT_ID = "904244810093-augr12q9unva1knkrslpc8evbpopu5cm.apps.googleusercontent.com";
var signInButton = ".google-button";
var revokeAccessButton = "#revoke-google";
function handleClientLoad() {
    //LOAD API's client and auth2 modules.
    //Call the initClient function after the modules load
    gapi.load("client:auth2", initClient);
}

function initClient() {
    //Retreive the discovery document for version 3 of Google Drive API.
    //In practice, your app can retreive one or more discovery documents.
    var discoveryUrl = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
    //Initialize the gapi.client object, witch app uses to make API requests.
    //Get API key and client ID from API Console.
    // 'scope' field specifies space-delimited list of access scopes.
    gapi.client.init({
        "apiKey": API_KEY,
        "discoveryDocs": [discoveryUrl],
        "clientId": CLIENT_ID,
        "scope": SCOPE
    }).then(() => {
        GoogleAuth = gapi.auth2.getAuthInstance();
        //Listen for sign-in state changes.
        GoogleAuth.isSignedIn.listen(updateSigninStatus);
        //Handle initial sign-in state. (Determine if user is already signed in.)
        var user = GoogleAuth.currentUser.get();
        //setSigninStatus();
        //Call handleAuthClick function when user clicks on 'Sign In/Authorize' button.
        $(document).on("click", signInButton, () => {
            handleAuthClick();
        });
        //Revoke access button
        $(document).on("click", revokeAccessButton, () => {
            handleAuthClick();
        });
    });
}

function handleAuthClick() {
    var user;
    if (GoogleAuth.isSignedIn.get()) {
        //User is authorized and has clicked 'Sign out' button
        GoogleAuth.signOut();
    } else {
        //User is not signed in. Start Google auth flow.
        GoogleAuth.signIn();
    }
}

function revokeAccess() {
    GoogleAuth.disconnect();
}

function setSigninStatus(isSignedIn) {
    var user = GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes(SCOPE);
    if (isAuthorized) {
        //You are currently signed in and have granted access to this app
        console.log("OK !");
        user = GoogleAuth.currentUser.get();
        var datas = {};
        //console.log(user);
        if (user.w3 !== undefined) {
            datas.email = user.w3.U3;
            console.log(datas);
            $.ajax({
                type : "POST",
                url: "/login-fast",
                data: datas,
                success: function (data){
                    console.log(data)
                    // update_front_with_msg(data, "login-msg");
                    if (data.errors !== undefined){
                        //update_front_with_errors(data.errors);
                    }
                    else{
                        //update_front_with_success();
                        document.location.reload();
                    }
                }
            });
        }
    } else {
        //You have not authorized this app or you are signed out.
        console.log("FAILED !");
    }
}

function updateSigninStatus(isSignedIn) {
    setSigninStatus(isSignedIn);
}