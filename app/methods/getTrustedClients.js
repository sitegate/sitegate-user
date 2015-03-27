'use strict';

var User = require('../../models/user');
var Client = require('../clients/client');

module.exports = function (userId, cb) {
  if (!userId) {
    return cb(new Error('userId is missing'));
  }
  
  User.findById(userId, function (err, user) {
    if (err) {
      return cb(err);
    }
    
    if (!user) {
      return cb(new Error('user not found'));
    }
    
    if (!user.trustedClients || user.trustedClients.length === 0) {
      return cb(null, []);
    }
    
    Client.getByIds(user.trustedClients, cb);
  });
};