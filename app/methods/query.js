'use strict';

const joi = require('joi')

module.exports = function(ms, opts, next) {
  ms.method({
    name: 'query',
    config: {
      validate: joi.object().keys({
        count: joi.number().required(),
      }),
    },
    handler(params, cb) {
      params.fields = params.fields || [];

      ms.models.User
        .find({}, params.fields.join(' '))
        .limit(params.count)
        .exec(cb);
    },
  });

  next()
}

module.exports.attributes = {
  name: 'query',
}
