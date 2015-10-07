'use strict';

module.exports = function(ms) {
  return function(params, cb) {
    params = params || {};
    params.fields = params.fields || [];

    if (!params.count) {
      return cb(new Error('count is missing'));
    }

    ms.models.User
      .find({}, params.fields.join(' '))
      .limit(params.count)
      .exec(cb);
  };
};
