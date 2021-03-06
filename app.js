//UPLOAD FILE
require('dotenv').config();
var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    app = express(),
    flash = require('connect-flash'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    Campground = require('./models/campground.js'),
    Comment = require('./models/comment'),
    User = require('./models/user'),
    methodOverride = require('method-override')
//REQUIRING ROUTE
var commentRoutes = require('./routes/comments'),
    campgroundRoutes = require('./routes/campgrounds'),
    indexRoutes = require('./routes/index')
SeedDB = require('./seed')
app.locals.moment = require('moment');
app.use(bodyParser.urlencoded({ extended: true }));
//mongoose.connect("mongodb+srv://hahunzyen:ajkg85@cluster0-o7xs3.mongodb.net/yeld_camp_map?retryWrites=true&w=majority", { useUnifiedTopology: true, useNewUrlParser: true });
mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useUnifiedTopology: true });
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(flash());
app.use(express.static(__dirname + "/public"));

// SeedDB();
//PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret: "One again RUsty win cutest dog",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
//USE NAY SẼ CHO 1 VAR TỒN TẠI TRONG TÂT CẢ ROUTE
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//ROUTES

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
//=====================
//COMMENTS ROUTES
//=====================

//=============
//AUTH ROUTE
//=============


app.listen(process.env.PORT || 3000, () => {
    console.log("SEVER HAS STARTED");
})