'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const registerPlugin = require('../../app/methods/register')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')

chai.use(chaiAsPromised)

const MONGO_URI = 'mongodb://localhost/sitegate-user-tests'

function sendVerificationEmail(server, opts, next) {
  server.method({
    name: 'sendVerificationEmail',
    handler(params, cb) {
      cb()
    },
  })

  next()
}

sendVerificationEmail.attributes = {
  name: 'send-verification-email',
}

let fakeUser = {
  username: 'sherlock',
  email: 'sherlock@holmes.uk',
  passwod: '123456',
  provider: 'local',
  displayName: 'Sherlock Holmes',
  emailVerified: false,
}

let fakeUserPlugin = helpers.userCreator(fakeUser)

describe('register', function() {
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

  it('should register user', function() {
    return this._server
      .register([
        {
          register: sendVerificationEmail,
        },
        {
          register: registerPlugin,
        },
      ])
      .then(() => this._server.methods
        .register({
          username: 'john.doe',
          email: 'some.email@gmail.com',
          password: 'qwerty',
          provider: 'local',
          displayName: 'John Doe',
          emailVerified: false,
        }))
      .then(user => {
        expect(user).to.exist
        expect(user.id).to.exist
      })
  })

  it('should return error if username already exists', function(done) {
    let result = this._server
      .register([
        fakeUserPlugin,
        {
          register: sendVerificationEmail,
        },
        {
          register: registerPlugin,
        },
      ])
      .then(() => this._server.methods
        .register({
          username: fakeUser.username,
          email: 'some.email@gmail.com',
          password: 'qwerty',
          provider: 'local',
          displayName: 'John Doe',
          emailVerified: false,
        }))

    expect(result).to.be
      .rejectedWith(Error, 'username already exists').notify(done)
  })

  it('should return error if email already exists', function(done) {
    let result = this._server
      .register([
        fakeUserPlugin,
        {
          register: sendVerificationEmail,
        },
        {
          register: registerPlugin,
        },
      ])
      .then(() => this._server.methods
        .register({
          username: 'john.doe',
          email: fakeUser.email,
          password: 'qwerty',
          provider: 'local',
          displayName: 'John Doe',
          emailVerified: false,
        }))

    expect(result).to.be
      .rejectedWith(Error, 'email already exists').notify(done)
  })
})
