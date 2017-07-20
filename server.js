var express = require('express');
var db = require('sqlite');
var Promise = require('bluebird');

var moment = require('moment');
var logger = require('morgan');
var bodyParser = require('body-parser');

/**
 * THe JWT middleware
 */
var jwtauth = require('./lib/jwtauth')
//var expressJWT = require('express-jwt');
//var jwt = require('jsonwebtoken');
var jwt = require('jwt-simple');


var User = require('./models/users');

const app = express();
const port = process.env.PORT || 3000;

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(logger('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));

app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // not restricted it our domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});


/**
 * Set the secret for encoding/decoding JWT tokens
 */
app.set('jwtTokenSecret', require('./config/secret')());

/**
 * Require tokens for the following routes
 */
//app.use(expressJWT({secret: app.get('jwtTokenSecret')}).unless({path: ['/login', '/somethingelse']}));


// Auth Middleware - This will check if the token is valid
// Only the requests that start with /api/v1/* will be checked for the token.
app.all('/api/v1/*', [require('./lib/validateRequest')]
/*	, 
	function(req, res, next){
		console.log("function 1");
		console.log("res.locals.myCustomNamespace.decodedToken=" + res.local.myCustomNamespace.decodedToken);
		console.log("function 1a");
		next();
	},
	function(err, req, res, next){	
		console.log("function 2");
		//console.log("res.locals.myCustomNamespace.decodedToken=" + res.local.myCustomNamespace.decodedToken);
		console.log('server.js next= ' + next);
		next();
	},
	function(err, req, res, next){
		console.log("function 3");
		console.log("res.locals.myCustomNamespace.decodedToken=" + res.local.myCustomNamespace.decodedToken);
 		res.send('Hello');
 	}*/
 );

app.use('/', require('./routes'));
 
// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
  var err = new Error('The item you have requested cannot be found!!');
  err.status = 404;
  next(err);
});



app.use(function(err, req, res, next) {
  // log the error, treat it like a 500 internal server error
  // maybe also log the request so you have more debug information
  //log.error(err, req);

  // during development you may want to print the errors to your console
  console.log(err.stack);

  // send back a 500 with a generic message
  //res.status(500);
  //res.send('oops! something broke');

  // send back a generic message
  res.status(err.status);
  res.send('oops! something is not right');
});


// /**
//  * A simple middleware to restrict access to authenticated users.
//  */
// var requireAuth = function(req, res, next) {
// 	if (!req.user) {
// 		res.end('Not authorized', 401)
// 	}	else {
// 		next()
// 	}
// }

// /**
//  * An example protected route.
//  */
// app.get('/secret', express.bodyParser(), jwtauth, requireAuth, function(req, res){	
// 	res.send('Hello ' + req.user.username)
// });

// app.post('/login', function(req, res){
// 	if(!req.body.username){
// 		res.status(400).send('username required');
// 		return;
// 	}
// 	if(!req.body.password){
// 		res.status(400).send('password required');
// 		return;
// 	}

// 	User.findOne({username: req.body.username}, function(err, user){

// 		if (err) { 
// 		// user not found 
// 		return res.send(401);
// 		}

// 		if (!user) {
// 		// incorrect username
// 		return res.send(401);
// 		}

// 		user.comparePassword(req.body.password, function(err, isMatch){
// 			if(err) throw err;

// 			if(!isMatch){
// 				res.status(401).send('Invalid Password');
// 			} else {
				
// 				//  Pass back the token with the user in the payload
// 				var expires = moment().add('days', 7).valueOf();
// 				var token = jwt.encode({
// 				  iss: user.id,
// 				  exp: expires
// 				}, app.get('jwtTokenSecret'));

// 				res.status(200).json({
// 				  token : token,
// 				  expires: expires,
// 				  user: user.toJSON()
// 				});
// 			}
// 		})
// 	});

// });

// app.get('/users', async (req, res, next) => {
// 	try{
// 		const users = await db.all('SELECT * from Users LIMIT 10');
// 		res.send(users);

// 	} catch (err)
// 	{
// 		next(err);
// 	}

// });

// app.get('/users/:id', async (req, res, next) => {
// 	try{
// 		const users = await db.all('SELECT * from Users WHERE id = ? LIMIT 10', req.params.id);
// 		res.send(users);

// 	} catch (err)
// 	{
// 		next(err);
// 	}

// });


//Cached DB Driver if you want to enable the database object cache
//db.open('./database.sqlite', { cached: true }))

Promise.resolve()
.then(() => db.open('./database.sqlite', { Promise }))
.then(() => db.migrate({ force: 'last'}))  // =>  db.migrate() (in production) 
.catch((err) => console.error(err.stack))
.finally(() => app.listen(port, function(){console.log('API server listening on ' + port)}));

