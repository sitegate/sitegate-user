'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

/* Constants */
var SALTLEN = 32;
var ITERATIONS = 25000;
var KEYLEN = 512;
var INTERVAL = 100;
var ENCODING = 'hex';
var MAX_INTERVAL = 300000;

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * User Schema
 */
var UserSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    default: ''
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  displayName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    default: '',
    validate: [validateLocalStrategyProperty, 'Please fill in your email'],
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  username: {
    type: String,
    unique: 'testing error message',
    required: 'Please fill in a username',
    trim: true,
    min: 5,
    max: 20
  },
  provider: {
    type: String,
    required: 'Provider is required'
  },
  providerData: {},
  additionalProvidersData: {},
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  /* Limit attempts */
  last: {
    type: Date,
    default: Date.now
  },
  attempts: {
    type: Number,
    default: 0
  },
  /* Password */
  hash: String,
  salt: String,
  /* For reset password */
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  // For email verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationTokenExpires: Date,
  trustedClients: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Client'
  }]
});

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
  var _this = this;
  var possibleUsername = username + (suffix || '');

  _this.findOne({
    username: possibleUsername
  }, function(err, user) {
    if (!err) {
      if (!user) {
        callback(possibleUsername);
      } else {
        return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
      }
    } else {
      callback(null);
    }
  });
};

UserSchema.methods.trusts = function(clientId) {
  return this.trustedClients && this.trustedClients.indexOf(clientId) !== -1;
};

UserSchema.pre('save', function(next) {
  this.username = this.username.toLowerCase();
  this.email = this.email.toLowerCase();

  next();
});

UserSchema.methods.setPassword = function(password, cb) {
  if (!password) {
    return cb(new Error('Password argument not set!'));
  }

  var self = this;

  crypto.randomBytes(SALTLEN, function(err, buf) {
    if (err) {
      return cb(err);
    }

    var salt = buf.toString(ENCODING);

    crypto.pbkdf2(password, salt, ITERATIONS, KEYLEN, function(err, hashRaw) {
      if (err) {
        return cb(err);
      }

      self.hash = new Buffer(hashRaw, 'binary').toString(ENCODING);
      self.salt = salt;

      cb(null, self);
    });
  });
};

UserSchema.methods.authenticate = function(password, cb) {
  var self = this;

  var attemptsInterval = Math.pow(INTERVAL, Math.log(this.attempts + 1));
  var calculatedInterval = (attemptsInterval < MAX_INTERVAL) ? attemptsInterval : MAX_INTERVAL;

  if (Date.now() - this.last < calculatedInterval) {
    this.last = Date.now();
    this.save();
    return cb(new Error('Login attempted too soon after previous attempt'), null);
  }

  if (!this.salt) {
    return cb(new Error('Authentication not possible. No salt value stored in mongodb collection!'), false);
  }

  crypto.pbkdf2(password, this.salt, ITERATIONS, KEYLEN, function(err, hashRaw) {
    if (err) {
      return cb(err);
    }

    var hash = new Buffer(hashRaw, 'binary').toString(ENCODING);

    if (hash === self.hash) {

      self.last = Date.now();
      self.attempts = 0;
      self.save();

      return cb(null, self);
    }

    self.last = Date.now();
    self.attempts = self.attempts + 1;
    self.save();
    return cb(new Error('Incorrect password'), null);
  });
};

UserSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = function(connection) {
  return connection.model('User', UserSchema);
};
