let express = require("express");
const multer = require('multer');
const upload = multer({dest: __dirname + '/uploads/images'});
const path = require('path');
const fs = require('fs');
const PORT = 3000;
let app = express();

// Listen on Port 3000
app.use(function(req, res, next) {
    console.log(`${new Date()} - ${req.method} request for ${req.url}`);
    next();
});

// Static files
app.use(express.static("../static"));

// Set Templating Engine
app.use('/js', express.static(__dirname + '../static/js'));
app.set('view engine', 'ejs');
app.set('views', '../static/views');

// Navigation
app.get('/', function (req, res) {
	console.log("Dirname" + __dirname);
	res.render('pages/index');
});

app.get('/about', function (req, res) {
  	res.render('pages/about');
});

app.get('/body_pose', function (req, res) {
  	res.render('pages/body_pose');
});

app.get('/image_pose', function (req, res) {
  	res.render('pages/image_pose');
});

app.get('/yoga_mudra', function (req, res) {
  	res.render('pages/yoga_mudra');
});

app.get('/train_bodypose', function (req, res) {
  	res.render('pages/train_bodypose');
});

app.get('/train_handpose', function (req, res) {
    res.render('pages/train_handpose');
});

// Listen on Port 3000
app.listen(PORT, () => {
    console.log('Listening at Port:' + PORT );
});

