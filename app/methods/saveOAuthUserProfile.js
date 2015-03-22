'use strict';

var User = require('../../models/user');

module.exports = function (params, cb) {
  var providerUserProfile = params.providerUserProfile;
  var loggedUser = params.loggedUser;
    
  if (!loggedUser) {
    // Define a search query fields
    var searchMainProviderIdentifierField =
      'providerData.' + providerUserProfile.providerIdentifierField;
    var searchAdditionalProviderIdentifierField =
      'additionalProvidersData.' + providerUserProfile.provider +
      '.' + providerUserProfile.providerIdentifierField;

    // Define main provider search query
    var mainProviderSearchQuery = {};
    mainProviderSearchQuery.provider = providerUserProfile.provider;
    mainProviderSearchQuery[searchMainProviderIdentifierField] =
      providerUserProfile
      .providerData[providerUserProfile.providerIdentifierField];

    // Define additional provider search query
    var additionalProviderSearchQuery = {};
    additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define a search query to find existing user with current provider profile
    var searchQuery = {
      $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
    };

    User.findOne(searchQuery, function (err, user) {
      if (err) {
        return cb(err);
      }

      if (!user) {
        var possibleUsername = providerUserProfile.username ||
          (providerUserProfile.email ? providerUserProfile.email.split('@')[0] : '');

        return User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
          var user = new User({
            firstName: providerUserProfile.firstName,
            lastName: providerUserProfile.lastName,
            username: availableUsername,
            displayName: providerUserProfile.displayName,
            email: providerUserProfile.email,
            emailVerified: true,
            provider: providerUserProfile.provider,
            providerData: providerUserProfile.providerData
          });

          // And save the user
          user.save(function (err) {
            return cb(err, user);
          });
        });
      }
      return cb(err, user);
    });
    
    return;
  }
  // User is already logged in, join the provider data to the existing user
  User.findById(loggedUser.id, function (err, user) {
    if (err) {
      return cb(err);
    }
        
    if (!user) {
      return cb(new Error('Logged in user not found in the datastore'));
    }

    // Check if user exists, is not signed in using this provider, and doesn't
    // have that provider data already configured
    if (user.provider !== providerUserProfile.provider &&
      (!user.additionalProvidersData ||
        !user.additionalProvidersData[providerUserProfile.provider])) {
      // Add the provider data to the additional provider data field
      if (!user.additionalProvidersData) {
        user.additionalProvidersData = {};
      }
      user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');
      
      // And save the user
      user.save(function (err) {
        return cb(err, user/*, '/settings/accounts'*/);
      });

      return;
    }
    
    return cb(new Error('User is already connected using this provider'), user);
  });
};