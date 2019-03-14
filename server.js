// get the packages we need ========================================
var express 	= require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var fs          = require('fs');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model
var WonStore = require('./app/models/won_number'); // get our mongoose model
var Counter = require('./app/models/counter'); // get our mongoose model
var path = require('path');
var cookieParser = require('cookie-parser')
var db_utils = require('./app/utils/db.js')
var csvFilePath = './static/csv/file.csv';
var xlsFilePath = './static/csv/wins.xlsx';
var winning_num_constants = require('./app/constants/constants.json')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var Excel = require('exceljs');
require('dotenv').config();



// configuration ===================================================
var port = process.env.PORT || 8080; 
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));
app.use(express.static('public'))
app.use(cookieParser());



// routes ==========================================================
app.get('/setup', function(req, res) {

	// create a sample user
	var mohan = new User({ 
		name: 'mohan', 
		password: 'password',
		admin: true 
	});
	mohan.save(function(err) {
		if (err) throw err;

		console.log('User saved successfully');
		res.json({ success: true });
	});
});

// basic route (http://localhost:8080)
app.get('/', function(req, res) {
	res.send('Hello! The API is at http://localhost:' + port + '/api');
});

app.get('/login', function(req, res) {
	fs.readFile('public/login.html',function (err, data){
		console.log(data);
		res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
		res.write(data);
		res.end();
	});
});
app.post('/signup', function(req, res) {
	var newUser = new User({ 
		name: req.body.username,
		email: req.body.email,
		password: req.body.password
	});
	newUser.save(function(err) {
		if (err) throw err;

		console.log('User saved successfully');
		// res.redirect('login/');
		res.json({ success: true });
	});

})
// get an instance of the router for api routes
var apiRoutes = express.Router(); 

// ---------------------------------------------------------
// authentication (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------
// http://localhost:8080/api/authenticate
apiRoutes.post('/game', function(req, res) {

	// find the user
	User.findOne({
		name: req.body.name
	}, function(err, user) {

		if (err) throw err;

		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else if (user) {

			// check if password matches
			if (user.password != req.body.password) {
				res.json({ success: false, message: 'Authentication failed. Wrong password.' });
			} else {

				// if user is found and password is right
				// create a token
				var payload = {
					admin: user.admin,
					id: user.id
				}
				var token = jwt.sign(payload, app.get('superSecret'), {
					expiresIn: 86400 // expires in 24 hours
				});
				// res.redirect('/api/game?token=' + token)

				fs.readFile('public/game/index.html',function (err, data){
					console.log(data);
					res.cookie('token', token, { maxAge: 900000});
					res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length, 'x-access-token': token});			        
					res.write(data);
					res.end();
				});

				// res.json({
				// 	success: true,
				// 	message: 'Enjoy your token!',
				// 	token: token
				// });
			}		

		}

	});
});

var checkAuth = function(req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];

	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {			
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });		
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;	
				next();
			}
		});

	} else {

		// if there is no token
		// return an error
		return res.status(403).send({ 
			success: false, 
			message: 'No token provided.'
		});
		
	}
	
}

// route middleware to authenticate and check token
apiRoutes.use(function(req, res, next) {
	console.log(req.user);
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];

	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {			
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });		
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;	
				next();
			}
		});

	} else {

		// if there is no token
		// return an error
		return res.status(403).send({ 
			success: false, 
			message: 'No token provided.'
		});
		
	}
	
});

// apiRoutes.use('/admin', express.static(path.join(__dirname, 'public')));

// authenticated routes
apiRoutes.get('/', function(req, res) {
	res.json({ message: 'Welcome to the coolest API on earth!' });
});

apiRoutes.get('/users', function(req, res) {
	User.find({}, function(err, users) {
		res.json(users);
	});
});

apiRoutes.get('/check', function(req, res) {
	console.log('check');
	console.log(db_utils);	
	// console.log(req.cookies);
	console.log(req.decoded);
	res.json(req.decoded);
});


// app.use('/game', [checkAuth(), express.static('public')]);

apiRoutes.get('/game', function(req, res) {
	console.log('game');
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];
	// res.redirect('/game/?token=' + token);
	fs.readFile('public/game/index.html',function (err, data){
		console.log(data);
		res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length, 'x-access-token': token});
		res.write(data);
		res.end();
	});
});


app.use('/api', apiRoutes);

app.listen(port);

var Pusher = require('pusher');

apiRoutes.post('/pusher/auth', function(req, res) {
	var socketId = req.body.socket_id;
	var channel = req.body.channel_name;
	var auth = pusher.authenticate(socketId, channel);
	res.send(auth);
});

apiRoutes.post('/game/user', function(req, res) {
	console.log('req.cookie');
	console.log(req.decoded);
	db_utils.findUserByID(req.decoded.id, function(user){
		if(!user) console.log('No user found');
		else{
			user.credit = req.body.credit;
			user.save(function(err) {
				if (err) throw err;
				
				console.log('User updated successfully');
				res.json({ success: true });
			})
		}
	});

	console.log(req.user);
	console.log(req.body);
});

apiRoutes.get('/game/user', function(req, res) {
	db_utils.findUserByID(req.decoded.id, function(user){
		if(!user) console.log('No user found');
		else{
			console.log('User founddd');
			WonStore.find({}).sort({date: -1}).limit(19).exec(function(err, nums) {
				if(err) throw err;
				let res_nums = nums.map((num) => {
					return num['won'];
				});
				console.log(res_nums);
				// res_nums.reverse();
				console.log();
				res.json({ success: true, credit: user.credit, history: res_nums});
			})
		}
	});
	console.log(req.body);
});

console.log(process.env.pusher_app_id);
console.log(process.env.pusher_key);
console.log(process.env.pusher_secret);
var pusher = new Pusher({
  appId: process.env.pusher_app_id,
  key: process.env.pusher_key,
  secret: process.env.pusher_secret,
  cluster: 'ap2',
  encrypted: true
});


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function generateRandNum(){
	console.log('sending');
	var random_nums = [];
	for(var i=0;i<3;i++){
		random_nums.push(getRandomInt(0,36));
	}
	var final_num = random_nums[getRandomInt(0,2)];

	var won_num = new WonStore({ 
		won: final_num 
	});
	won_num.save(function(err) {
		if (err) throw err;
		console.log('Winning number stored successfully');
	});

	console.log({
	  "message": "SPIN",
	  "numbers": random_nums,
	  "number": final_num,
	});
	console.log(winning_num_constants);
	pusher.trigger('my-channel', 'my-event', {
	  "message": "SPIN",
	  "numbers": random_nums,
	  "number": final_num,
	});
}
// generateRandNum();

var cron = require('node-cron');
cron.schedule('*/3 * * * *', () => {
	generateRandNum();
});



var csvDump = function(res = false){
	const csvWriter = createCsvWriter({
	    path: csvFilePath,
	    // append: true,
	    header: [
	    	{id: "date", title: "date"},
	    	{id: "time", title: "time"},
	        {id: "number", title: "number"},
			{id: "colour", title: "colour"},
			{id: "1-18 / 19-36", title: "1-18 / 19-36"},
			{id: "odd / even", title: "odd / even"},
			{id: "dozen", title: "dozen"},
			{id: "column", title: "column"},
			{id: "three", title: "three"},
			{id: "six", title: "six"},
			{id: "corners", title: "corners"},
			{id: "call", title: "call"},
			{id: "neighbours", title: "neighbours"},
	    ]
	});

	WonStore.find({}).sort({date: -1}).exec(function(err, nums) {
		if(err) throw err;

		let orderedNums = nums.sort((a,b) => {
			return b['date'].getTime() - a['date'].getTime();
		});

		let wons = orderedNums.map((num) => {
			let won = JSON.parse(JSON.stringify(winning_num_constants[num['won']])),
				date = num['date'];
			// console.log(typeof(new Date(num['date'])));
			won['date'] = date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
			won['time'] = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
			return won;
		});

		csvWriter.writeRecords(wons)       // returns a promise
		.then(() => {
		    // console.log('...Done');
		    if(res)	res.sendFile(path.join(__dirname, csvFilePath));
		})
		.catch((err) => {
			console.log(err);
		})
	});


	// csvWriter.writeRecords(records)       // returns a promise
	// .then(() => {
	//     console.log('...Done');
	// });
}
csvDump();



apiRoutes.get('/csv', function(req, res) {
	csvDump();
	var workbook = new Excel.Workbook();
	workbook.csv.readFile(csvFilePath)
	.then(function(worksheet) {
	    // use workbook or worksheet
	    workbook.xlsx.writeFile(xlsFilePath)
	    .then(function() {
	        console.log('DONE');
	        res.sendFile(path.join(__dirname, xlsFilePath));
	    });
	});

})



app.get('/csv', function(req, res) {
	csvDump();
	var workbook = new Excel.Workbook();
	workbook.csv.readFile(csvFilePath)
	.then(function(worksheet) {
	    // use workbook or worksheet
	    workbook.xlsx.writeFile(xlsFilePath)
	    .then(function() {
	        console.log('DONE');
	        saveLog('download')
	        res.sendFile(path.join(__dirname, xlsFilePath));
	    });
	});

});

app.get('/game/history', function(req, res) {
	console.log('fetch history');
	WonStore.find({}).sort({date: -1}).limit(19).exec(function(err, nums) {
		if(err) throw err;
		let res_nums = nums.map((num) => {
			return num['won'];
		});
		console.log(res_nums);
		// res_nums.reverse();
		console.log();
		res.json({success: true, history: res_nums});
	});
	console.log(req.body);
});

function saveLog(name, cb){
	console.log(name);
	var count = new Counter({ 
		name: name
	});
	console.log(count);
	count.save(function(err) {
		if (err) throw err;
		console.log('Count entry added');
		if(cb)	cb(true);
	});
}

function getLog(name, cb){
	console.log(name);
	console.log(typeof(name));
	try{
		console.log(JSON.parse(name));
		(Array.isArray(JSON.parse(name))) ? console.log('ARRAY') : console.log('NOT ARRAY')
		name = JSON.parse(name);
	}
	catch(e){
		console.log('Not able to parse');
	}
	console.log(name);
	Counter.find({name: name}, function(err, logs) {
		if (err) throw err;
		let res = {};
		logs.forEach((log) => {
			if(res[log.name]) res[log.name] += 1;
			else res[log.name] = 1;
		});
		console.log(res);


		if(cb) cb(res);

	});
}


app.post('/game/count', function(req, res) {
	saveLog(req.body.name, function(){
		res.json({ success: true });
	});
});

app.get('/game/count', function(req, res) {
	var name = req.param('name');
	console.log(name);
	
	getLog(name, function(count){
		res.json({ success: true, data: count});
	});
});




