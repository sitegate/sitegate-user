'use strict';

/**
 * Returns a user by its Username
 *
 * @param {string} id - The unique ID of the User.
 * @param {Object} [options] - Options that can define what data should
 * be returned.
 * @param {function} [cb] - A callback function that will consume the results.
 */
module.exports = function(ms) {
  return function() {
    var username = arguments[0];
    var options, cb;
    if (typeof arguments[1] === 'function') {
      cb = arguments[1];
    } else {
      options = arguments[1];
      cb = arguments[2];
    }

    options = options || {};
    options.fields = options.fields || [];

    ms.models.User.findOne({ username: username }, options.fields.join(' '), cb);
  };
};
