var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
router.get('/', (req, res) => {
    res.render('landing');
});

//show register form
router.get('/register', (req, res) => {
    res.render('register');
})

//handle the regiser form
router.post('/register', (req, res) => {
    var newUser = new User({ username: req.body.username, adminCode: req.body.adminCode });
    if (newUser.adminCode === "otarlzg1") {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            req.flash("error", err.message);
            return res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, () => {
                req.flash("success", "Welcome to YelCamp " + user.username);
                res.redirect("/campgrounds");
            })
        }
    })
})

//show login form
router.get('/login', (req, res) => {
    res.render('login');
})

router.post('/login', passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: "/login"
}), (req, res) => {
});

// logout routes
router.get('/logout', (req, res) => {
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect('/campgrounds');
})

module.exports = router