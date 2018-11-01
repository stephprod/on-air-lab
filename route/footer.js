 const express = require('express');
const router = express.Router();
const session = require('express-session');
const User = require('../models/req_user');



router.route('/footer')
    .get((req, res) => {
        res.render('pages/footer', {userId : req.session.userId})
    	console.log("footer appelé !")
    })

    .post((req, res) => {

});

module.exports = router;
