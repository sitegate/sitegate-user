'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const getById = require('../../app/methods/get-by-id')
const sendVerificationEmail = require('../../app/methods/send-verification-email')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const plugiator = require('plugiator')

chai.use(chaiAsPromised)

const MONGO_URI = 'mongodb://localhost/sitegate-user-tests'

let fakeUser = {
  username: 'sherlock',
  email: 'sherlock@holmes.uk',
  passwod: '123456',
  provider: 'local',
  displayName: 'Sherlock Holmes',
  emailVerified: false,
}

let fakeUserPlugin = helpers.userCreator(fakeUser)

describe('sendVerificationEmail', function() {
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

  it('should send verification email', function() {
    return this._server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: plugiator.noop('mailer'),
        },
        {
          register: plugiator.create('jimbo-client', (server, opts) => {
            server.expose('mailer', {
              send(params) {
                expect(params.locals.username).to.exist
                expect(params.locals.token).to.exist
              },
            })
          }),
        },
        {
          register: getById,
        },
        {
          register: sendVerificationEmail,
        },
      ])
      .then(() => this._server.methods.sendVerificationEmail({
          userId: this._server.fakeUser.id,
        }))
  })
})
