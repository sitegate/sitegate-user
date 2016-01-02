'use strict';

function createQuery(providerUserProfile) {
  // Define a search query fields
  let searchMainProviderIdentifierField =
    'providerData.' + providerUserProfile.providerIdentifierField;
  let searchAdditionalProviderIdentifierField =
    'additionalProvidersData.' + providerUserProfile.provider +
    '.' + providerUserProfile.providerIdentifierField;

  // Define main provider search query
  let mainProviderSearchQuery = {
    provider: providerUserProfile.provider,
  };
  mainProviderSearchQuery[searchMainProviderIdentifierField] =
    providerUserProfile
    .providerData[providerUserProfile.providerIdentifierField];

  // Define additional provider search query
  let additionalProviderSearchQuery = {};
  additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

  // Define a search query to find existing user with current provider profile
  let searchQuery = {
    $or: [mainProviderSearchQuery, additionalProviderSearchQuery],
  };

  return searchQuery;
}

function createPossibleUsername(providerUserProfile) {
  if (providerUserProfile.username) return providerUserProfile.username;

  if (providerUserProfile.email) return providerUserProfile.email.split('@')[0];

  return '';
}

module.exports = function(ms) {
  let User = ms.models.User;

  return function(params, cb) {
    if (!params)
      return cb(new Error('params is required'));

    if (!params.providerUserProfile)
      return cb(new Error('params.providerUserProfile is required'));

    if (!params.providerUserProfile.providerIdentifierField)
      return cb(new Error('params.providerUserProfile.providerIdentifierField is required'));

    let providerUserProfile = params.providerUserProfile;
    let loggedUser = params.loggedUser;

    if (!loggedUser) {
      let searchQuery = createQuery(providerUserProfile);

      User.findOne(searchQuery, function(err, user) {
        if (err) return cb(err);

        if (user) return cb(err, user);

        let possibleUsername = createPossibleUsername(providerUserProfile);

        return User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
          let user = new User({
            firstName: providerUserProfile.firstName,
            lastName: providerUserProfile.lastName,
            username: availableUsername,
            displayName: providerUserProfile.displayName,
            email: providerUserProfile.email,
            emailVerified: true,
            provider: providerUserProfile.provider,
            providerData: providerUserProfile.providerData,
          });

          // And save the user
          user.save(err => cb(err, user));
        });
      });

      return;
    }
    // User is already logged in, join the provider data to the existing user
    User.findById(loggedUser.id, function(err, user) {
      if (err)
        return cb(err);

      if (!user)
        return cb(new Error('Logged in user not found in the datastore'));

      // Check if user exists, is not signed in using this provider, and doesn't
      // have that provider data already configured
      if (!(user.provider !== providerUserProfile.provider &&
        (!user.additionalProvidersData ||
          !user.additionalProvidersData[providerUserProfile.provider]))) {

        return cb(new Error('User is already connected using this provider'), user);
      }

      // Add the provider data to the additional provider data field
      if (!user.additionalProvidersData) {
        user.additionalProvidersData = {};
      }
      user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');

      // And save the user
      user.save(err => cb(err, user/*, '/settings/accounts'*/));
    });
  };
};
