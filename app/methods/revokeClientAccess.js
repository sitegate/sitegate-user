'use strict';

module.exports = function(ms) {
  const User = ms.models.User;

  return function(params, cb) {
    params = params || {};

    if (!params.userId)
      return cb(new Error('userId is missing'));
    if (!params.clientId)
      return cb(new Error('clientId is missing'));

    User.findById(params.userId, function(err, user) {
      if (err) return cb(err);

      if (!user) return cb(new Error('User not found'));

      user.trustedClients
        .splice(user.trustedClients.indexOf(params.clientId), 1);

      user.save((err) => cb(err, user));
    });
  };
};
