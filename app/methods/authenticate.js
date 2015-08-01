'use strict';

var User = require('../../models/user');

module.exports = function authenticate(params, cb) {
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
      return cb(new Error('incorrectUsernameOrEmail'), user);
    }

    return user.authenticate(params.password, cb);
  });
};
