var mongoose = require('mongoose');
// mongoose.set('useNewUrlParser', true);
mongoose.connect("mongodb://localhost/cat_app", { useNewUrlParser: true, useUnifiedTopology: true });
//Structure for cat data
var catSchema = new mongoose.Schema({
    name: String,
    age: Number,
    temperament: String,
});

var Cat = mongoose.model("Cat", catSchema);

//adding a new cat to DB
//CREATE
// var george = new Cat({
//     name: "Mrs.Norris",
//     age: 7,
//     temperament: "Evil"
// });
//SAVE
// george.save((err, cat) => {
//     if (err) {
//         console.log("something went wrong!");
//     } else {
//         console.log("We just save a cat to database");
//         console.log(cat);
//     }
// })
//CREATE AND SAVE AT THE SAME TIME
Cat.create({
    name: "Snow White",
    age: 15,
    temperament: "Bland"
}, (err, cat) => {
    if (err) {
        console.log("ERROR");
    } else {
        console.log(cat);
    }
})
//Retrieve all cats from the DB and console.log each one

Cat.find({}, (err, cats) => {
    if (err) {
        console.log("ERROR");
        console.log(err);
    } else {
        console.log("ALL THE CAT...");
        console.log(cats);
    }
})