'use strict';
var crypto = require('crypto');

var users = {
 
  getAll: function(req, res) {
    console.log("users::getAll");
    var allusers = data; // Spoof a DB call
    res.locals.myCustomNamespace.allUsers = allusers;
  },
 
  getOne: function(req, res) {
    var id = req.params.id;
    var user = data[0]; // Spoof a DB call
    res.json(user);
  },
 
  create: function(req, res) {
    console.log('create new user');
    let newuser = user;
    let passwordData = {};

   if (!req.body || req.body.username === undefined || req.body.password === undefined) {
        console.log('create user requires username and password');
        res.status(400);
        res.json({
          "status": 400,
          "message": "Missing username or password"
        });
        return;
    }

    newuser.username = req.body.username;
    newuser.role = 'user';
    passwordData = saltHashPassword(req.body.password);
    newuser.password = passwordData.passwordHash;
    newuser.salt = passwordData.salt;

    //  Todo - persist user to database   
    data.push(newuser); // Spoof a DB call
    res.json(newuser);
  },
 
  update: function(req, res) {
    var updateuser = req.body;
    var id = req.params.id;
    data[id] = updateuser // Spoof a DB call
    res.json(updateuser);
  },
 
  delete: function(req, res) {
    var id = req.params.id;
    data.splice(id, 1) // Spoof a DB call
    res.json(true);
  }, 

  validatePassword: function(username, passwordAttempt) {
    let authenticated = false;
    let user = undefined;
    
    //  TODO get user where user.username ==, salt and hashed password
    user = getUserByUsername(username);
    if (user === undefined) { 
      return {user:null, authenticated:false};
    }

    let savedHash =  user.password;
    let savedSalt = user.salt;
    //  compare saved hash to generated hash
    authenticated = isPasswordCorrect(savedHash, savedSalt, passwordAttempt);
    return {user:user, authenticated:authenticated}

  }
};

function getUserByUsername(username) {
  //TODO replace with database query
  // var keys = Object.keys( data );
  //  for( var i = 0,length = keys.length; i < length; i++ ) {
  //      console.log('i='+i);
  //       console.log(data[ keys[ i ] ]);
  //       console.log(data[ keys[ i ] ].username);
  //  }
  let user = undefined;

  Object.keys(data).forEach(function(key) {
    var val = data[key];
    if(val.username == username)
    {
      console.log('found user' + val);
      user = val;
      return;
    }

  });

  return user;
}

function genRandomString(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') 
            .slice(0,length);   
};

function sha512(password, salt){
    var hash = crypto.createHmac('sha512', salt); 
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

function saltHashPassword(userpassword) {
    var salt = genRandomString(16); // salt length
    var passwordData = sha512(userpassword, salt);
    console.log('UserPassword = '+userpassword);
    console.log('Passwordhash = '+passwordData.passwordHash);
    console.log('nSalt = '+passwordData.salt);
    return passwordData;
}

function isPasswordCorrect(savedHash, savedSalt, passwordAttempt) {
    var passwordData = sha512(passwordAttempt, savedSalt);
    return savedHash == passwordData.passwordHash;
}

var user = { username:'', password:'', role:''};
var roles = {admin:1, user:2};
var data = [{
  id: '1',
  username: 'jim',
  password: '4188ee2b8ac04136f6c8ea10a99a25e14469eba795805c3ccc8f2d728c56afb39de9b0ede0c49ef4cb75bd432a383d9c99692643d276355b538e91e2d4259e93',
  salt: 'b1b8d346e10cd32d',
  roleId: '1'
}, {
  id: '2',
  username: 'user 2',
  password: 'asdfzzzz',
  salt: 'salt',
  roleId: '0'
}, {
  id: '3',
  username: 'user 3',
  password: 'asdfzzzz',
  salt: 'salt',
  roleId: '0'
}];
 
module.exports = users;