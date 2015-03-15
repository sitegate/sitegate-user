'use strict';

var User = require('../models/user');

module.exports = function (params, cb) {
  User.findOne({
    $or: [{
        username: params.usernameOrEmail
      }, {
        email: params.usernameOrEmail
      }
    ]
  }, function (err, user) {
    if (err || !user) {
      return cb(err, user);
    }
        
    return user.authenticate(params.password, cb);
  });
};