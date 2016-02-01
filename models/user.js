'use strict'
const thenify = require('thenify').withCallback
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const crypto = require('crypto')

/* Constants */
const SALTLEN = 32
const ITERATIONS = 25000
const KEYLEN = 512
const INTERVAL = 100
const ENCODING = 'hex'
const MAX_INTERVAL = 300000

/**
 * A Validation function for local strategy properties
 */
function validateLocalStrategyProperty(property) {
  return (this.provider !== 'local' && !this.updated) ||
    property && property.length
}

/**
 * User Schema
 */
let UserSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    default: '',
  },
  lastName: {
    type: String,
    trim: true,
    default: '',
  },
  displayName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    default: '',
    validate: [validateLocalStrategyProperty, 'Please fill in your email'],
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  username: {
    type: String,
    unique: 'testing error message',
    required: 'Please fill in a username',
    trim: true,
    min: 5,
    max: 20,
  },
  provider: {
    type: String,
    required: 'Provider is required',
  },
  providerData: {},
  additionalProvidersData: {},
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  updated: {
    type: Date,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  /* Limit attempts */
  last: {
    type: Date,
    default: Date.now,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  /* Password */
  hash: String,
  salt: String,
  /* For reset password */
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  // For email verification
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationTokenExpires: Date,
  trustedClients: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Client',
    },
  ],
})

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = thenify(function(username, suffix, cb) {
  let possibleUsername = username + (suffix || '')

  this.findOne({
    username: possibleUsername,
  }, (err, user) => {
    if (err) return cb(err)

    if (!user) return cb(null, possibleUsername)

    return this.findUniqueUsername(username, (suffix || 0) + 1, cb)
  })
})

UserSchema.methods.trusts = function(clientId) {
  return this.trustedClients && this.trustedClients.indexOf(clientId) !== -1
}

UserSchema.pre('save', function(next) {
  this.username = this.username.toLowerCase()
  this.email = this.email.toLowerCase()

  next()
})

UserSchema.methods.setPassword = function(password) {
  if (!password)
    return Promise.reject(new Error('Password argument not set!'))

  let salt
  return thenify(crypto.randomBytes)(SALTLEN)
    .then(buf => {
      salt = buf.toString(ENCODING)
      return thenify(crypto.pbkdf2)(password, salt, ITERATIONS, KEYLEN)
    })
    .then(hashRaw => {
      this.hash = new Buffer(hashRaw, 'binary').toString(ENCODING)
      this.salt = salt

      return Promise.resolve(this)
    })
}

UserSchema.methods.authenticate = function(password) {
  let attemptsInterval = Math.pow(INTERVAL, Math.log(this.attempts + 1))
  let calculatedInterval = Math.min(attemptsInterval, MAX_INTERVAL)

  if (Date.now() - this.last < calculatedInterval) {
    this.last = Date.now()
    this.save()
    return Promise.reject(new Error('Login attempted too soon after previous attempt'))
  }

  if (!this.salt) {
    return Promise.reject(new Error('Authentication not possible. No salt value stored in mongodb collection!'))
  }

  return thenify(crypto.pbkdf2)(password, this.salt, ITERATIONS, KEYLEN)
    .then(hashRaw => {
      let hash = new Buffer(hashRaw, 'binary').toString(ENCODING)

      if (hash === this.hash) {
        this.last = Date.now()
        this.attempts = 0
        this.save()

        return Promise.resolve(this)
      }

      this.last = Date.now()
      this.attempts++
      this.save()
      return Promise.reject(new Error('Incorrect password'))
    })
}

UserSchema.set('toJSON', {
  transform(doc, ret, options) {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

module.exports = function(connection) {
  return connection.model('User', UserSchema)
}
