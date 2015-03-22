'use strict';

var User = require('../../models/user');
var sendVerificationEmail = require('./sendVerificationEmail');

module.exports = function (params, cb) {
  console.log('Called update');
  
  User.findById(params.id, function (err, user) {
    if (err || !user) {
      return cb(err, user);
    }
    
    user.username = params.username || user.username;

    var newEmail = params.email ? params.email.toLowerCase() : null;
    var emailHasBeenUpdated = newEmail && (newEmail !== user.email);

    user.email = newEmail;
    if (emailHasBeenUpdated) {
      user.emailVerified = false;
    }
    
    user.save(function (err, user) {
      if (err) {
        return cb(err, null);
      }
      
      if (emailHasBeenUpdated) {
        sendVerificationEmail({
          userId: user._id,
          appTitle: undefined, //!?
          host: undefined //!?
        });
      }
      
      return cb(err, user, {
        emailHasBeenUpdated: emailHasBeenUpdated
      });
    });
  });
};