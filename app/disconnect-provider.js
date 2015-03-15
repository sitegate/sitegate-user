'use strict';

var User = require('../models/user');

module.exports = function (params, cb) {
  params = params || {};
  
  if (!params.userId)  {
    return cb(new Error('userId is missing'));
  }
  
  if (!params.strategy)  {
    return cb(new Error('strategy is missing'));
  }
  
  User.findById(params.userId, function (err, user) {
    if (err) {
      return cb(err);
    }

    if (!user) {
      return cb(new Error('The logged user not found in the datastore'));
    }

    if (user.provider.toLowerCase() === params.strategy.toLowerCase()) {
      return cb(new Error('Can\' disconnect the main provider'));
    }

    if (!user.additionalProvidersData ||
        !user.additionalProvidersData[params.strategy]) {
      return cb(new Error('User doesn\'t have this provider'));
    }

    delete user.additionalProvidersData[params.strategy];

    user.markModified('additionalProvidersData');

    user.save(function (err) {
      if (err) {
        return cb(err);
      }
      
      return cb(null);
    });
  });
};