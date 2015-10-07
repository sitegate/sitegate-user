'use strict';

module.exports = function(ms) {
  return function(userId, cb) {
    if (!userId) {
      return cb(new Error('userId is missing'));
    }

    ms.models.User.findById(userId, function(err, user) {
      if (err) {
        return cb(err);
      }

      if (!user) {
        return cb(new Error('user not found'));
      }

      if (!user.trustedClients || user.trustedClients.length === 0) {
        return cb(null, []);
      }

      ms.clients.client.query({ ids: user.trustedClients }, cb);
    });
  };
};
