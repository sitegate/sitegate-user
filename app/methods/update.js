'use strict';

module.exports = function(ms) {
  var User = ms.models.User;
  var sendVerificationEmail = ms.methods.sendVerificationEmail;

  return function update(id, params, cb) {
    User.findById(id, function(err, user) {
      if (err) {
        return cb(err, user);
      }

      if (!user) {
        return cb(new Error('userNotFound'));
      }

      user.username = params.username || user.username;

      var newEmail = params.email ? params.email.toLowerCase() : null;
      var sendVerificationEmail;

      if (typeof params.emailVerified === 'boolean') {
        user.emailVerified = params.emailVerified;
      } else {
        var emailHasBeenUpdated = newEmail && (newEmail !== user.email);
        sendVerificationEmail = emailHasBeenUpdated;

        if (emailHasBeenUpdated) {
          user.emailVerified = false;
        }
      }

      user.email = newEmail;
      user.role = params.role || user.role;

      user.save(function(err, user) {
        if (err) {
          return cb(err, null);
        }

        if (sendVerificationEmail) {
          sendVerificationEmail({
            userId: user._id
          });
        }

        return cb(err, user, {
          emailHasBeenUpdated: emailHasBeenUpdated
        });
      });
    });
  };
};
