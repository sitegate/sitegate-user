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

module.exports = function (server) {
  server.addMethods({
    getById: getById,
    update: update,
    // requires email, host and appTitle
    resetPasswordByEmail: resetPasswordByEmail,
    // token
    validateResetToken: validateResetToken,
    // token, newPassword
    resetPassword: resetPassword,
    signUp: register,
    saveOAuthUserProfile: saveOAuthUserProfile,
    disconnectProvider: disconnectProvider,
    changePassword: changePassword,
    verifyEmail: verifyEmail,
    getTrustedClients: getTrustedClients,
    authenticate: authenticate
  });
};