var jwt = require('jwt-simple');
var validateUser = require('./loginAuth').validateUser;
 
module.exports = function(req, res, next) {
 
  // When performing a cross domain request, you will receive a preflighted request first. 
  // We skip the token auth for [OPTIONS] requests.
  //  Done now in server JS as an express app.all operative
  //  if(req.method == 'OPTIONS') next();


 
  var token = undefined;
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        token = req.headers.authorization.split(' ')[1];
        console.log('validateRequest req.headers.authorization Bearer token = ' + token);
    } else if (req.query && req.query.access_token) {
        token = req.query.access_token;
        console.log('validateRequest req.query.access_token = ' + token);
    } else if (req.body && req.body.access_token) {
        token = req.query.access_token;
        console.log('validateRequest req.body.access_token = ' + token);
    } else if (req.headers['x-access-token']) {
        token = req.headers['x-access-token'];
        console.log('validateRequest req.headers[x-access-token] = ' + token);
    }

  var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];
 
  console.log('validateRequest token= ' + token);
  console.dir(token);
  if (token !== undefined) {
    try {
      var decoded = jwt.decode(token, require('../config/secret.js')());
      var dateNow = Date.now()/1000;
      console.log('decoded = ' + decoded);
      console.dir(decoded);

      if (decoded.exp <= dateNow) {
        console.log('validateRequest token expired');
        res.status(400);
        res.json({
          "status": 400,
          "message": "Token Expired"
        });
        return;
      }
 

// This is a stateless authentication mechanism as the user state is never saved in server memory. 
// The server's protected routes will check for a valid JWT in the Authorization header, and if it's present, the user will be allowed to access protected resources. 
// As JWTs are self-contained, all the necessary information is there, reducing the need to query the database multiple times.
      


/*      // Authorize the user to see if s/he can access our resources 
      var dbUser = validateUser(key); // The key would be the logged in user's username
      if (dbUser) {
        if ((req.url.indexOf('admin') >= 0 && dbUser.role == 'admin') || (req.url.indexOf('admin') < 0 && req.url.indexOf('/api/v1/') >= 0)) {
          next(); // To move to next middleware
        } else {
          res.status(403);
          res.json({
            "status": 403,
            "message": "Not Authorized"
          });
          return;
        }
      } else {
        // No user with this name exists, respond back with a 401
        res.status(401);
        res.json({
          "status": 401,
          "message": "Invalid User"
        });
        return;
      }
      */
      // res.local : An object that contains response local variables scoped to the request, and therefore available only to the view(s) 
      // rendered during that request / response cycle (if any). Otherwise, this property is identical to app.locals.
      // This property is useful for exposing request-level information such as the request path name, authenticated user, user settings, and so on.
      //  Passing request scoped variables to future middleware, here we are passing user authentication token 
      //  from this early middleware which will persist claims that get routed/used in some downstream middlewares
      //  Add the token to the res local obj
      res.locals.myCustomNamespace = {};
      res.locals.myCustomNamespace.decodedToken = decoded;

      //  Callbacks for router flow don't care if you return anything from your functions, so return next() and next(); return; are basically the same.
      return next(); 
    } catch (err) {
      console.log('validateRequest error = ' + err.message);
      res.status(500);
      res.json({
        "status": 500,
        "message": "Oops something went wrong",
        "error": err
      });
    }
  } else if (key) {
    try {
      // Authorize the user to see if s/he can access our resources
      var dbUser = validateUser(key); // The key would be the logged in user's username
      if (dbUser) {
        if ((req.url.indexOf('admin') >= 0 && dbUser.role == 'admin') || (req.url.indexOf('admin') < 0 && req.url.indexOf('/api/v1/') >= 0)) {
          next(); // To move to next middleware
        } else {
          res.status(403);
          res.json({
            "status": 403,
            "message": "Not Authorized"
          });
          return;
        }
      } else {
        // No user with this name exists, respond back with a 401
        res.status(401);
        res.json({
          "status": 401,
          "message": "Invalid User"
        });
        return;
      }
 
    } catch (err) {
      res.status(500);
      res.json({
        "status": 500,
        "message": "Oops something went wrong",
        "error": err
      });
    }
  } else {
    res.status(401);
    res.json({
      "status": 401,
      "message": "Invalid Token or Key"
    });
    return;
  }
};