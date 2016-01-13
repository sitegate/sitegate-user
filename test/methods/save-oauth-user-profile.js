'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const getById = require('../../app/methods/get-by-id')
const saveOAuthUserProfile = require('../../app/methods/save-oauth-user-profile')
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

describe('saveOAuthUserProfile', function() {
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
      {
        register: getById,
      },
    ], err => next(err))
  })
  afterEach(mongotest.disconnect());

  it('should create new account for new user', function() {
    return this._server
      .register([
        {
          register: saveOAuthUserProfile,
        },
      ])
      .then(() => this._server.methods.saveOAuthUserProfile({
        providerUserProfile: {
          username: 'james.bond',
          email: 'james.bond@gmail.com',
          providerIdentifierField: 'id',
          provider: 'facebook',
          providerData: {
            id: 'f34f34f3f',
            username: 'james.bond',
            email: 'james.bond@gmail.com',
          },
        },
        loggedUser: undefined,
      }))
      .then(user => {
        expect(user).to.exist
        expect(user.id).to.exist
      })
  })

  it('should extend an existing account with a new provider', function(done) {
    return this._server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: saveOAuthUserProfile,
        },
      ])
      .then(() => this._server.methods.saveOAuthUserProfile({
        providerUserProfile: {
          username: 'james.bond',
          email: fakeUser.email,
          providerIdentifierField: 'id',
          provider: 'facebook',
          providerData: {
            id: 'f34f34f3f',
            username: 'james.bond',
            email: 'james.bond@gmail.com',
          },
        },
        loggedUser: {
          id: fakeUser.id,
        },
      }))
      .then(user => {
        expect(user).to.exist
        expect(user.id).to.eq(fakeUser.id)
        done()
      })
  })
})
