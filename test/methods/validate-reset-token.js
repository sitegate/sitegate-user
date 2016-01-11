'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const validateResetToken = require('../../app/methods/validate-reset-token')
const R = require('ramda')

chai.use(chaiAsPromised)

const MONGO_URI = 'mongodb://localhost/sitegate-user-tests'

let fakeUser = {
  username: 'sherlock',
  email: 'sherlock@holmes.uk',
  passwod: '123456',
  provider: 'local',
  displayName: 'Sherlock Holmes',
  emailVerified: false,
  resetPasswordToken: 'f34f3f43gwgw45g34',
}

describe('validateResetToken', function() {
  beforeEach(mongotest.prepareDb(MONGO_URI));
  beforeEach(function(next) {
    this._server = new jimbo.Server()

    this._server.register([
      {
        register: modelsPlugin,
        options: {
          mongoURI: MONGO_URI,
        },
      },
    ], err => next(err))
  })
  afterEach(mongotest.disconnect());

  it('should reset password if valid params passed', function(done) {
    let result = this._server
      .register([
        {
          register: helpers.userCreator(R.merge(fakeUser, {
            resetPasswordExpires: Date.now() + 1000 * 60 * 60,
          })),
        },
        {
          register: validateResetToken,
        },
      ])
      .then(() => this._server.methods.validateResetToken({
        token: fakeUser.resetPasswordToken,
      }))
    expect(result).to.eventually.eq(null).notify(done)
  })

  it('should fail if reset token expired', function(done) {
    let result = this._server
      .register([
        {
          register: helpers.userCreator(R.merge(fakeUser, {
            resetPasswordExpires: Date.now() - 1000 * 60 * 60,
          })),
        },
        {
          register: validateResetToken,
        },
      ])
      .then(() => this._server.methods.validateResetToken({
        token: fakeUser.resetPasswordToken,
      }))
    expect(result).to.be.rejectedWith(Error, 'Reset token expired').notify(done)
  })

  it('should fail if reset token doesn\'t exist', function(done) {
    let result = this._server
      .register([
        {
          register: helpers.userCreator(R.merge(fakeUser, {
            resetPasswordExpires: Date.now() + 1000 * 60 * 60,
          })),
        },
        {
          register: validateResetToken,
        },
      ])
      .then(() => this._server.methods.validateResetToken({
        token: 'this token doesn\'t exist',
      }))
    expect(result).to.be.rejectedWith(Error, 'Invalid reset token').notify(done)
  })
})
