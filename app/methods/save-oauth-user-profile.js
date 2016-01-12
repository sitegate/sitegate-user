'use strict'
const joi = require('joi')

function createQuery(providerUserProfile) {
  // Define a search query fields
  let searchMainProviderIdentifierField =
    'providerData.' + providerUserProfile.providerIdentifierField
  let searchAdditionalProviderIdentifierField =
    'additionalProvidersData.' + providerUserProfile.provider +
    '.' + providerUserProfile.providerIdentifierField

  // Define main provider search query
  let mainProviderSearchQuery = {
    provider: providerUserProfile.provider,
  }
  mainProviderSearchQuery[searchMainProviderIdentifierField] =
    providerUserProfile
    .providerData[providerUserProfile.providerIdentifierField]

  // Define additional provider search query
  let additionalProviderSearchQuery = {}
  additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField]

  // Define a search query to find existing user with current provider profile
  let searchQuery = {
    $or: [mainProviderSearchQuery, additionalProviderSearchQuery],
  }

  return searchQuery
}

function createPossibleUsername(providerUserProfile) {
  if (providerUserProfile.username) return providerUserProfile.username

  if (providerUserProfile.email) return providerUserProfile.email.split('@')[0]

  return ''
}

module.exports = function(service, opts) {
  let User = service.plugins.models.User

  function createUser(providerUserProfile) {
    let searchQuery = createQuery(providerUserProfile)

    return User.findOne(searchQuery).exec()
      .then(user => {
        if (user) return Promise.resolve(user)

        let possibleUsername = createPossibleUsername(providerUserProfile)

        return User.findUniqueUsername(possibleUsername, null)
          .then(availableUsername => {
            let user = new User({
              firstName: providerUserProfile.firstName,
              lastName: providerUserProfile.lastName,
              username: availableUsername,
              displayName: providerUserProfile.displayName,
              email: providerUserProfile.email,
              emailVerified: true,
              provider: providerUserProfile.provider,
              providerData: providerUserProfile.providerData,
            })

            // And save the user
            return user.save()
          })
      })
  }

  function extendUser(loggedUser, providerUserProfile) {
    // User is already logged in, join the provider data to the existing user
    return User.findById(loggedUser.id).exec()
      .then(user => {
        if (!user)
          return Promise.reject(new Error('Logged in user not found in the datastore'))

        // Check if user exists, is not signed in using this provider, and doesn't
        // have that provider data already configured
        if (!(user.provider !== providerUserProfile.provider &&
          (!user.additionalProvidersData ||
            !user.additionalProvidersData[providerUserProfile.provider]))) {

          return Promise.reject(new Error('User is already connected using this provider'), user)
        }

        // Add the provider data to the additional provider data field
        if (!user.additionalProvidersData) {
          user.additionalProvidersData = {}
        }
        user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData

        // Then tell mongoose that we've updated the additionalProvidersData field
        user.markModified('additionalProvidersData')

        // And save the user
        return user.save()
      })
  }

  service.method({
    name: 'saveOAuthUserProfile',
    config: {
      validate: {
        providerUserProfile: {
          username: joi.string().required(),
          email: joi.string().required(),
          firstName: joi.string(),
          lastName: joi.string(),
          displayName: joi.string(),
          providerIdentifierField: joi.string().required(),
          provider: joi.string().required(),
          providerData: joi.object().required(),
        },
        loggedUser: {
          id: joi.string(),
        },
      },
    },
    handler(params) {
      let providerUserProfile = params.providerUserProfile
      let loggedUser = params.loggedUser

      if (loggedUser)
        return extendUser(loggedUser, providerUserProfile)

      return createUser(providerUserProfile)
    },
  })
}

module.exports.attributes = {
  name: 'save-oauth-user-profile',
}
