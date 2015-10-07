'use strict';

module.exports = function(ms) {
  var User = ms.models.User;
  var mailer = ms.clients.mailer;

  return function(params, cb) {
    params = params || {};

    if (!params.token) {
      return cb(new TypeError('token parameter is missing'));
    }
    if (!params.newPassword) {
      return cb(new TypeError('newPassword parameter is missing'));
    }

    User.findOne({
      resetPasswordToken: params.token,
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

      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      user.setPassword(params.newPassword, function(err, user) {
        if (err) {
          return cb(err, null);
        }

        user.save(function(err) {
          if (err) {
            return cb(err, null);
          }

          mailer.send({
            templateName: 'reset-password-confirm-email',
            to: user.email,
            locals: {
              username: user.username
            }
          }, function() {});

          return cb(null, user);
        });
      });
    });
  };
};
