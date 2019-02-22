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
var path = require('path');



// configuration ===================================================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));
app.use(express.static('public'))



// routes ==========================================================
app.get('/setup', function(req, res) {

	// create a sample user
	var nick = new User({ 
		name: 'mohan', 
		password: 'password',
		admin: true 
	});
	nick.save(function(err) {
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
					admin: user.admin	
				}
				var token = jwt.sign(payload, app.get('superSecret'), {
					expiresIn: 86400 // expires in 24 hours
				});
				// res.redirect('/api/game?token=' + token)

				fs.readFile('public/game/index.html',function (err, data){
			    	console.log(data);
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


var pusher = new Pusher({
  appId: '719111',
  key: '006f63484e47855233d2',
  secret: '1147b87f7161ef80178a',
  cluster: 'ap2',
  encrypted: true
});


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

var cron = require('node-cron');
cron.schedule('* * * * *', () => {
	console.log('sending');
	var random_nums = [];
	for(var i=0;i<3;i++){
		random_nums.push(getRandomInt(0,36));
	}
	var final_num = random_nums[getRandomInt(0,2)]
	console.log({
	  "message": "SPIN",
	  "numbers": random_nums,
	  "number": final_num,
	});
	pusher.trigger('my-channel', 'my-event', {
	  "message": "SPIN",
	  "numbers": random_nums,
	  "number": final_num,
	});
})


