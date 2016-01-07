'use strict';

const joi = require('joi')

function saveNewPassword(user, params, cb) {
  user.setPassword(params.newPassword, function(err, user) {
    if (err) {
      return cb(err)
    }

    user.save(function(err) {
      if (err) {
        return cb(err)
      }

      return cb(err, user)
    });
  });
}

module.exports = function(ms, opts, next) {
  let User = ms.plugins.models.User

  ms.method({
    name: 'changePassword',
    config: {
      validate: joi.object().keys({
        userId: joi.string().required(),
        newPassword: joi.string().required(),
      }),
    },
    handler(params, cb) {
      User.findById(params.userId, function(err, user) {
        if (err) {
          return cb(err)
        }

        if (!user) {
          return cb(new Error('User not found'))
        }

        if (params.forceNewPassword || typeof user.hash === 'undefined') {
          return saveNewPassword(user, params, cb)
        }
        user.authenticate(params.currentPassword, function(err, user) {
          if (err || !user) {
            return cb(err, user)
          }

          return saveNewPassword(user, params, cb)
        });
      });
    },
  });

  next()
}

module.exports.attributes = {
  name: 'changePassword',
}
