'use strict'

const joi = require('joi')

module.exports = function(ms, opts, next) {
  ms.method({
    name: 'disconnectProvider',
    config: {
      validate: joi.object().keys({
        userId: joi.string().required(),
        strategy: joi.string().required(),
      }),
    },
    handler(params, cb) {
      ms.plugins.models.User.findById(params.userId, function(err, user) {
        if (err) {
          return cb(err)
        }

        if (!user) {
          return cb(new Error('The logged user not found in the datastore'))
        }

        if (user.provider.toLowerCase() === params.strategy.toLowerCase()) {
          return cb(new Error('Can\' disconnect the main provider'))
        }

        if (!user.additionalProvidersData ||
            !user.additionalProvidersData[params.strategy]) {
          return cb(new Error('User doesn\'t have this provider'))
        }

        delete user.additionalProvidersData[params.strategy]

        user.markModified('additionalProvidersData')

        user.save(function(err) {
          if (err) {
            return cb(err)
          }

          return cb(null)
        });
      });
    },
  });

  next()
};

module.exports.attributes = {
  name: 'disconnect-provider',
}
