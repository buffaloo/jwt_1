var jwt = require('jwt-simple');
const expiryDate = 7; // 7 days 
var usersService = require('../models/users'); 
var loginAuth = {
 
  getToken: function(req, res) {
    login(req,res);
  },

  login: function(req, res) {
 
    var username = req.body.username || '';
    var password = req.body.password || '';
 
    if (username == '' || password == '') {
      res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid credentials"
      });
      return;
    }
 
    // Get user 
    let validationObj = loginAuth.validate(username, password);
   
    if (validationObj.user == null) { // If authentication fails, we send a 401 back
      res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid credentials"
      });
      return;
    }

    // If authentication is success, we will generate a token and return it to the client  
    if (validationObj.authenticated) {
      res.json(genToken(validationObj.user));
    }
    else
    {
      //  Authentication failed
      res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid credentials"
      });
      return;
    }
 
  },
 
  validate: function(username, password) {
    // spoofing the DB response for simplicity
    var dbUserObject = { // spoofing a userobject from the DB. 
      name: 'arvind',
      role: 'admin',
      username: 'arvind@myapp.com'
    };
 
    return usersService.validatePassword(username, password);
  },
 
  validateUser: function(username) {
    // spoofing the DB response for simplicity
    console.log('auth:validateUser with username='+username);
    var dbUserObject = { // spoofing a userobject from the DB. 
      name: 'arvind',
      role: 'admin',
      username: 'arvind@myapp.com'
    };
 
    return dbUserObject;
  },
}
 
// private method
function genToken(user) {
  var expires = expiresIn(expiryDate); 
  var token = jwt.encode({
    exp: expires,
    iat: Date.now(),
    user: user
  }, require('../config/secret')());
 
  return {
    token: token,
    expires: new Date(expires)
  };
}
 
function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}
 
module.exports = loginAuth;