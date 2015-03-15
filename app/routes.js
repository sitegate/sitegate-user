'use strict';

var getById = require('./get-by-id');
var resetPasswordByEmail = require('./reset-password-by-email');
var update = require('./update');
var validateResetToken = require('./validate-reset-token');
var resetPassword = require('./reset-password');
var sendVerificationEmail = require('./send-verification-email');
var register = require('./register');
var saveOAuthUserProfile = require('./save-oauth-user-profile');
var disconnectProvider = require('./disconnect-provider');
var trustClient = require('./trust-client');
var changePassword = require('./change-password');
var verifyEmail = require('./verify-email');
var getTrustedClients = require('./get-trusted-clients');
var authenticate = require('./authenticate');

module.exports = function (worker) {
  worker.on('user.getById', getById);

  worker.on('user.update', update);

  // requires email, host and appTitle
  worker.on('user.resetPasswordByEmail', resetPasswordByEmail);
  
  // token
  worker.on('user.validateResetToken', validateResetToken);
  
  // token, newPassword
  worker.on('user.resetPassword', resetPassword);
  
  worker.on('user.register', register);
  
  worker.on('user.saveOAuthUserProfile', saveOAuthUserProfile);
  
  worker.on('user.disconnectProvider', disconnectProvider);
  
  worker.on('user.changePassword', changePassword);
  
  worker.on('user.verifyEmail', verifyEmail);
  
  worker.on('user.getTrustedClients', getTrustedClients);
  
  worker.on('user.authenticate', authenticate);
};