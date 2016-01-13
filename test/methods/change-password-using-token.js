'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const validateResetToken = require('../../app/methods/validate-reset-token')
const changePasswordUsingToken = require('../../app/methods/change-password-using-token')
const R = require('ramda')
const plugiator = require('plugiator')

chai.use(chaiAsPromised)

const MONGO_URI = 'mongodb://localhost/sitegate-user-tests'

let fakeUser = {
  username: 'sherlock',
  email: 'sherlock@holmes.uk',
  provider: 'local',
  displayName: 'Sherlock Holmes',
  password: '1jf20dW34',
}

describe.only('changePasswordUsingToken', function() {
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

  this.timeout(6000)

  it('should change password when correct reset token passed', function() {
    let newPassword = 'J7W&92+xc:;d-a,'
    return this._server
      .register([
        {
          register: helpers.userCreator(R.merge(fakeUser, {
            resetPasswordToken: 'f34f3f43gwgw45g34',
            resetPasswordExpires: Date.now() + 1000 * 60 * 60,
          })),
        },
        {
          register: plugiator.create('jimbo-client', (server, opts) => {
            server.expose('mailer', {
              send() {},
            })
          }),
        },
        {
          register: validateResetToken,
        },
        {
          register: changePasswordUsingToken,
        },
      ])
      .then(() => this._server.methods.changePasswordUsingToken({
        token: this._server.fakeUser.resetPasswordToken,
        newPassword,
      }))
      .then(user => {
        expect(user).to.exist
        expect(user.id).to.exist
        expect(user.resetPasswordToken).to.not.exist
        expect(user.resetPasswordExpires).to.not.exist
        return user.authenticate(newPassword)
      })
  })
})
