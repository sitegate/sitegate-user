'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const changePassword = require('../../app/methods/change-password')
const R = require('ramda')

chai.use(chaiAsPromised)

const MONGO_URI = 'mongodb://localhost/sitegate-user-tests'

let fakeUser = {
  username: 'sherlock',
  email: 'sherlock@holmes.uk',
  password: '123456',
  provider: 'local',
  displayName: 'Sherlock Holmes',
  emailVerified: false,
  emailVerificationToken: 'f34f3f43gwgw45g34',
}

describe('changePassword', function() {
  beforeEach(mongotest.prepareDb(MONGO_URI));
  beforeEach(function(next) {
    this._server = new jimbo.Server()

    this._server.connection({
      channel: 'sitegate-user',
      url: 'amqp://guest:guest@localhost:5672',
    })

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

  this.timeout(4000)

  it('should change password when correct current password passed', function() {
    return this._server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: changePassword,
        },
      ])
      .then(() => this._server.methods.changePassword({
        userId: fakeUser.id,
        currentPassword: fakeUser.password,
        newPassword: 'new password',
      }))
  })

  it('should return error if incorrect current password', function(done) {
    let result = this._server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: changePassword,
        },
      ])
      .then(() => this._server.methods.changePassword({
        userId: fakeUser.id,
        currentPassword: 'incorrect password',
        newPassword: 'new password',
      }))

    expect(result).to.be.rejectedWith(Error, 'Incorrect password').notify(done)
  })

  it('should return error if incorrect user id', function(done) {
    let result = this._server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: changePassword,
        },
      ])
      .then(() => this._server.methods.changePassword({
        userId: '507f191e810c19729de860ea',
        currentPassword: fakeUser.password,
        newPassword: 'new password',
      }))

    expect(result).to.be.rejectedWith(Error, 'User not found').notify(done)
  })

  it('should force new password', function() {
    return this._server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: changePassword,
        },
      ])
      .then(() => this._server.methods.changePassword({
        userId: fakeUser.id,
        newPassword: 'new password',
        forceNewPassword: true,
      }))
  })
})
