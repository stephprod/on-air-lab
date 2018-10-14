 let express = require('express');
let router = express.Router();
let session = require('express-session');
let User = require('../models/req_user');



router.route('/footer')
    .get((req, res) => {
        res.render('pages/footer', {userId : req.session.userId})
    	console.log("footer appelé !")
    })

    .post((req, res) => {

});

module.exports = router;