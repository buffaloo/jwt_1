var express = require('express');
var router = express.Router();
 
//  Externalize the business logic for each route
var loginAuth = require('../lib/loginAuth.js');
var users = require('../models/users.js');
var products = require('../models/products.js')
 
/*
 * Routes that can be accessed by any one
 */
router.post('/login', loginAuth.login);
router.post('/getToken', loginAuth.login); 

/*
 * Routes that can be accessed only by authenticated users
 */
router.get('/api/v1/products', products.getAll);
router.get('/api/v1/product/:id', products.getOne);
router.post('/api/v1/product/', products.create);
router.put('/api/v1/product/:id', products.update);
router.delete('/api/v1/product/:id', products.delete);
 
/*
 * Routes that need authentication as well as authorization. Like deleting users or updating configs etc. (like an admin task). 
 * For this authentication alone would not suffice, you need to be authorized to access that resource.
 */
router.get('/api/v1/admin/users', 	function(req, res, next){
		console.log("function 1 users");
		users.getAll(req, res);		
		console.log("res.locals.myCustomNamespace.allUsers=" + res.locals.myCustomNamespace.allUsers);
		console.log("function 1a users");
		res.json(res.locals.myCustomNamespace.allUsers);
		res.send()
	});
router.get('/api/v1/admin/user/:id', users.getOne);
router.post('/api/v1/admin/user/', users.create);
router.put('/api/v1/admin/user/:id', users.update);
router.delete('/api/v1/admin/user/:id', users.delete);
 
module.exports = router;