'use strict';


module.exports = function(ms) {
  var User = ms.models.User;

  return function(token, cb) {
    if (!token) {
      return cb(new TypeError('Token is required in the token validation function'), null);
    }

    User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: {
        $gt: Date.now()
      }
    }, function(err, user) {
      if (err) {
        return cb(err, null);
      }

      if (!user) {
        return cb(new Error('Invalid reset token'), null);
      }

      return cb(null, null);
    });
  };
};
