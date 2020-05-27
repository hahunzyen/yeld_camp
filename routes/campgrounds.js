var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
//SẼ TỰ CHỌN INDEX.JS NẾU MÌNH CHỈ ĐIỀN THƯ MỤC MIDDLEWARE , KO CẦN /INDEX.JS , SẼ CẦN NẾU FILE LÀ TÊN KHÁC
var middleware = require('../middleware')
var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};
//UPDATE FILE CLOUDINARY CONFIG

var multer = require('multer');
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dpnyi9skm',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

var geocoder = NodeGeocoder(options);

//ROUTE
// router.get('/', (req, res) => {
//     // Get all camgrounds from DB
//     Campground.find({}, (err, allCampgrounds) => {
//         if (err) {
//             console.log(err);
//         } else {
//             res.render("campgrounds/index", { campgrounds: allCampgrounds })
//         }
//     });
//     // res.render('camgrounds', { camgrounds: camgrounds });
// });
router.get("/", function (req, res) {
    var noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({ name: regex }, function (err, allCampgrounds) {
            if (err) {
                console.log(err);
            } else {
                if (allCampgrounds.length < 1) {
                    noMatch = "No campgrounds match that name, please try again.";
                }
                res.render("campgrounds/index", { campgrounds: allCampgrounds, noMatch: noMatch });
            }
        });
    } else {
        // Get all campgrounds from DB
        Campground.find({}, function (err, allCampgrounds) {
            if (err) {
                console.log(err);
            } else {
                res.render("campgrounds/index", { campgrounds: allCampgrounds, noMatch: noMatch });
            }
        });
    }
});
// router.post("/", middleware.isLoggedIn, (req, res) => {
//     //get data from form and add to camgrounds array
//     var name = req.body.name;
//     var image = req.body.image;
//     var description = req.body.description
//     var price = req.body.price;
//     var author = {
//         id: req.user._id,
//         username: req.user.username
//     }
//     //make thing into object and add to array
//     var newCampground = { name: name, price: price, image: image, description: description, author: author };
//     // Create a new camp and save to DB
//     Campground.create(newCampground, (err, newlyCreate) => {
//         if (err) {
//             console.log(err);
//         } else {
//             res.redirect("/campgrounds");
//         }
//     });
// });
//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function (req, res) {
    // get data from form and add to campgrounds array


    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
            if (err) {
                req.flash('error', 'err.message');
                res.redirect('back')
            }
            // add cloudinary url for the image to the campground object under image property
            req.body.image = result.secure_url;
            req.body.image_id = result.public_id;
            var name = req.body.name;
            var image = req.body.image;
            var desc = req.body.description;
            var price = req.body.price;
            var imageId = req.body.image_id;
            // add author to campground
            var author = {
                id: req.user._id,
                username: req.user.username
            }
            var lat = data[0].latitude;
            var lng = data[0].longitude;
            var location = data[0].formattedAddress;
            var newCampground = { name: name, price: price, image: image, imageId: imageId, description: desc, author: author, location: location, lat: lat, lng: lng };
            // Create a new campground and save to DB
            Campground.create(newCampground, function (err, newlyCreated) {
                if (err) {
                    console.log(err);
                } else {
                    //redirect back to campgrounds page
                    //console.log(newlyCreated);
                    res.redirect("/campgrounds");
                }
            });
        });



    });
});
router.get('/new', middleware.isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});
router.get("/:id", (req, res) => {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate('comments likes').exec((err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash("error", "Campground not found")
            res.redirect("back");
        } else {
            //render show template with that campground
            res.render("campgrounds/show", { campgrounds: foundCampground });
        }
    });
})

//EDIT CAMPGROUND ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwenerShip, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err) {
            res.redirect('/campgrounds');
        } else {
            res.render('campgrounds/edit', { campground: foundCampground });
        }
    });
})
//UPDATE CAMPGROUND ROUTE
// router.put('/:id', (req, res) => {
//     //find and update the coorect campground
//     Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
//         if (err) {
//             res.redirect('/campgrounds');
//         } else {
//             res.redirect('/campgrounds/' + req.params.id);
//         }
//     })
// })

// UPDATE CAMPGROUND ROUTE
// UPDATE CAMPGROUND ROUTE
// UPDATE CAMPGROUND ROUTE
router.put("/:id", upload.single('image'), function (req, res) {
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
        Campground.findById(req.params.id, async function (err, campground) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                if (req.file) {
                    await cloudinary.v2.uploader.destroy(campground.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    campground.imageId = result.public_id;
                    campground.image = result.secure_url;
                }
                campground.name = req.body.campground.name;
                campground.price = req.body.campground.price;
                campground.description = req.body.campground.description;
                campground.lat = req.body.campground.lat;
                campground.lng = req.body.campground.lng
                campground.location = req.body.campground.location
                campground.save();
                console.log(campground);
                req.flash("success", "Successfully Updated!");
                res.redirect("/campgrounds/" + campground._id);
            }
        });
        // Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, campground) {

        //     if (err) {
        //         req.flash("error", err.message);
        //         res.redirect("back");
        //     } else {
        //         req.flash("success", "Successfully Updated!");
        //         res.redirect("/campgrounds/" + campground._id);
        //     }
        // });
    });
});


//DESTROY CAMPGROUND ROUTE
router.delete('/:id', middleware.checkCampgroundOwenerShip, upload.single('image'), async function (req, res) {
    // Campground.findById(req.params.id, (err, foundCampground) => {
    //     if (err) {
    //         res.redirect('/campgrounds');
    //     } else {
    //         foundCampground.deleteMany();
    //         res.redirect('/campgrounds');
    //     }
    // })
    try {
        let foundCampground = await Campground.findById(req.params.id);
        await cloudinary.v2.uploader.destroy(foundCampground.imageId);
        await foundCampground.remove();
        res.redirect("/campgrounds");
    } catch (error) {
        console.log(error.message);
        res.redirect("/campgrounds");
    }
})
//LIKE ROUTE
router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundCampground.likes.push(req.user);
        }

        foundCampground.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundCampground._id);
        });
    });
});
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router