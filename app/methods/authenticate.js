'use strict';

module.exports = function(ms) {
  var User = ms.models.User;

  return function authenticate(params, cb) {
    User.findOne({
      $or: [{
          username: params.usernameOrEmail
        }, {
          email: params.usernameOrEmail
        }
      ]
    }, function(err, user) {
      if (err) {
        return cb(err, user);
      }

      if (!user) {
        return cb(new Error('incorrectUsernameOrEmail'), user);
      }

      return user.authenticate(params.password, cb);
    });
  };
};
