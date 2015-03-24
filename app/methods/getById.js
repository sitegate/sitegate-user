'use strict';

var User = require('../../models/user');

module.exports = function (id, cb) {
  User.findById(id, cb);
};