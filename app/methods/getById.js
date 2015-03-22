'use strict';

var User = require('../../models/user');

module.exports = function (params, cb) {
  console.log('Called user.getById with id ' + params.id);
  User.findById(params.id, cb);
};