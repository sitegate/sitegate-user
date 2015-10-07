'use strict';

function saveNewPassword(user, params, cb) {
  user.setPassword(params.newPassword, function(err, user) {
    if (err) {
      return cb(err);
    }

    user.save(function(err) {
      if (err) {
        return cb(err);
      }

      return cb(err, user);
    });
  });
}

module.exports = function(ms) {
  var User = ms.models.User;

  return function(params, cb) {
    params = params || {};

    if (!params.userId) {
      return cb(new Error('userId is missing'));
    }

    if (!params.newPassword) {
      return cb(new Error('newPassword is missing'));
    }

    User.findById(params.userId, function(err, user) {
      if (err) {
        return cb(err);
      }

      if (!user) {
        return cb(new Error('User not found'));
      }

      if (params.forceNewPassword || typeof user.hash === 'undefined') {
        return saveNewPassword(user, params, cb);
      }
      user.authenticate(params.currentPassword, function(err, user) {
        if (err || !user) {
          return cb(err, user);
        }

        return saveNewPassword(user, params, cb);
      });
    });
  };
};
