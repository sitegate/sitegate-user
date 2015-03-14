'use strict';

var getById = require('get-by-id');
var resetPasswordByEmail = require('reset-password-by-email');
var update = require('update');
var validateResetToken = require('validate-reset-token');
var resetPassword = require('reset-password');
var sendVerificationEmail = require('send-verification-email');

module.exports = function (worker) {
  worker.on('user.getById', getById);

  worker.on('user.update', update);

  // requires email, host and appTitle
  worker.on('user.resetPasswordByEmail', resetPasswordByEmail);
  
  // token
  worker.on('user.validateResetToken', validateResetToken);
  
  // token, newPassword
  worker.on('user.resetPassword', resetPassword);
  
  // requires userId, host and appTitle
  worker.on('user.sendVerificationEmail', sendVerificationEmail);
};