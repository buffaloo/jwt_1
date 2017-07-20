/**
 * jwtauth
 *
 *  A simple middleware for parsing a JWt token attached to the request. If the token is valid, the corresponding user object
 *  will be attached to the request.
 */

var url = require('url')
var UserModel = require('../models/users')
var jwt = require('jwt-simple');

module.exports = function(req, res, next){
	
	// Parse the URL, we might need this
	var parsed_url = url.parse(req.url, true)

	/**
	 * Take the token from:
	 * 
	 *  - the POST value access_token
	 *  - the GET parameter access_token
	 *  - the x-access-token header
	 *    ...in that order.
	 */

	 // The client should be sending the token in the Authorization header, using the Bearer scheme, 
	 // as 'X-' headers have been deprecated since 2012

	var token = (req.body && req.body.access_token) || parsed_url.query.access_token || req.headers["x-access-token"] || req.get('Authorization').substring(7);

	if (token) {

		try {
			var decoded = jwt.decode(token, app.get('jwtTokenSecret'))

			if (decoded.exp <= Date.now()) {
				res.end('Access token has expired', 400)				
			}

			UserModel.findOne({ '_id': decoded.iss }, function(err, user){

				if (!err) {					
					req.user = user									
					return next()
				}
			})

		} catch (err) {			
			return next()
		}

	} else {

		next()

	}
}