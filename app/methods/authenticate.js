'use strict';

var User = require('../../models/user');
var ServerError = require('bograch').ServerError;

module.exports = function (params, cb) {
  User.findOne({
    $or: [{
        username: params.usernameOrEmail
      }, {
        email: params.usernameOrEmail
      }
    ]
  }, function (err, user) {
    if (err) {
      return cb(err, user);
    }
    
    if (!user) {
      return cb(new ServerError('incorrectUsernameOrEmail'), user);
    }
    
    return user.authenticate(params.password, cb);
  });
};