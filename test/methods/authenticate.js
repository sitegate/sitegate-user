'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const authenticate = require('../../app/methods/authenticate')
const R = require('ramda')
const plugiator = require('plugiator')
const config = require('../../config')

chai.use(chaiAsPromised)

let fakeUser = {
  username: 'sherlock',
  email: 'sherlock@holmes.uk',
  provider: 'local',
  displayName: 'Sherlock Holmes',
  emailVerified: false,
  resetPasswordToken: 'f34f3f43gwgw45g34',
  password: '1jf20dW34',
}

describe('authenticate', function() {
  let server

  beforeEach(mongotest.prepareDb(config.get('mongodbURI')));
  beforeEach(function() {
    server = jimbo()

    return server.register([
      {
        register: modelsPlugin,
        options: {
          mongoURI: config.get('mongodbURI'),
        },
      },
    ])
  })
  afterEach(mongotest.disconnect());

  this.timeout(6000)

  it('should authenticate user with correct credentials by username', function() {
    return server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: authenticate,
        },
      ])
      .then(() => server.methods.authenticate({
        usernameOrEmail: fakeUser.username,
        password: fakeUser.password,
      }))
      .then(user => {
        expect(user).to.exist
        expect(user.id).to.exist
      })
  })

  it('should authenticate user with correct credentials by email', function() {
    return server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: authenticate,
        },
      ])
      .then(() => server.methods.authenticate({
        usernameOrEmail: fakeUser.email,
        password: fakeUser.password,
      }))
      .then(user => {
        expect(user).to.exist
        expect(user.id).to.exist
      })
  })

  it('should not authenticate user with correct username and incorrect password', function(done) {
    let result = server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: authenticate,
        },
      ])
      .then(() => server.methods.authenticate({
        usernameOrEmail: fakeUser.username,
        password: 'not correct password',
      }))

    expect(result).to.be.rejectedWith(Error, 'Incorrect password').notify(done)
  })

  it('should not authenticate user with incorrect username or email field', function(done) {
    let result = server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: authenticate,
        },
      ])
      .then(() => server.methods.authenticate({
        usernameOrEmail: 'not.exists',
        password: fakeUser.password,
      }))

    expect(result).to.be
      .rejectedWith(Error, 'incorrectUsernameOrEmail').notify(done)
  })
})
