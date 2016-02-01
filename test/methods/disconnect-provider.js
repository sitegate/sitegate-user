'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const getById = require('../../app/methods/get-by-id')
const disconnectProvider = require('../../app/methods/disconnect-provider')
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
  additionalProvidersData: {
    facebook: {
      id: '2423',
    },
  },
}

describe('disconnectProvider', function() {
  let server

  beforeEach(mongotest.prepareDb(MONGO_URI));
  beforeEach(function() {
    server = jimbo()

    server.register([
      {
        register: modelsPlugin,
        options: {
          mongoURI: MONGO_URI,
        },
      },
      {
        register: getById,
      },
    ])
  })
  afterEach(mongotest.disconnect());

  this.timeout(4000)

  it('should disconnect not main provider', function() {
    return server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: disconnectProvider,
        },
      ])
      .then(() => server.methods.disconnectProvider({
        userId: fakeUser.id,
        strategy: 'facebook',
      }))
      .then(user => {
        expect(user.additionalProvidersData.facebook).to.not.exist
      })
  })

  it('should not disconnect main provider', function(done) {
    let result = server
      .register([
        {
          register: helpers.userCreator(R.merge(fakeUser, {
            provider: 'facebook',
          })),
        },
        {
          register: disconnectProvider,
        },
      ])
      .then(() => server.methods.disconnectProvider({
        userId: server.fakeUser.id,
        strategy: 'facebook',
      }))

    expect(result).to.be
      .rejectedWith(Error, 'Can\' disconnect the main provider').notify(done)
  })

  it('should return error when disconnecting non-connected provider', function(done) {
    let result = server
      .register([
        {
          register: helpers.userCreator(R.merge(fakeUser, {
            provider: 'facebook',
          })),
        },
        {
          register: disconnectProvider,
        },
      ])
      .then(() => server.methods.disconnectProvider({
        userId: server.fakeUser.id,
        strategy: 'github',
      }))

    expect(result).to.be
      .rejectedWith(Error, 'User doesn\'t have this provider').notify(done)
  })
})
