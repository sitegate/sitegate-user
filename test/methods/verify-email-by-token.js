'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const getById = require('../../app/methods/get-by-id')
const verifyEmailByToken = require('../../app/methods/verify-email-by-token')
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
  emailVerificationToken: 'f34f3f43gwgw45g34',
}

describe('verifyEmailByToken', function() {
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

  it('should verify email if token not expired', function() {
    return this._server
      .register([
        {
          register: helpers.userCreator(R.merge(fakeUser, {
            emailVerificationTokenExpires: Date.now() + 1000 * 60 * 60,
          })),
        },
        {
          register: getById,
        },
        {
          register: verifyEmailByToken,
        },
      ])
      .then(() => this._server.methods.verifyEmailByToken({
        token: fakeUser.emailVerificationToken,
      }))
      .then(() => this._server.methods.getById({
        id: this._server.fakeUser.id,
      }))
      .then(user => {
        expect(user.emailVerified).to.be.true
        expect(user.emailVerificationToken).to.not.exist
      })
  })

  it('should fail if reset token expired', function(done) {
    let result = this._server
      .register([
        {
          register: helpers.userCreator(R.merge(fakeUser, {
            emailVerificationTokenExpires: Date.now() - 1000 * 60 * 60,
          })),
        },
        {
          register: verifyEmailByToken,
        },
      ])
      .then(() => this._server.methods.verifyEmailByToken({
        token: fakeUser.emailVerificationToken,
      }))
    expect(result).to.be.rejectedWith(Error, 'Email verification token expired').notify(done)
  })

  it('should fail if reset token doesn\'t exist', function(done) {
    let result = this._server
      .register([
        {
          register: helpers.userCreator(R.merge(fakeUser, {
            emailVerificationTokenExpires: Date.now() + 1000 * 60 * 60,
          })),
        },
        {
          register: verifyEmailByToken,
        },
      ])
      .then(() => this._server.methods.verifyEmailByToken({
        token: 'this token doesn\'t exist',
      }))
    expect(result).to.be.rejectedWith(Error, 'Invalid email verification token').notify(done)
  })
})
