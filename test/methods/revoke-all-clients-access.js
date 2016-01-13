'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const getById = require('../../app/methods/get-by-id')
const revokeAllClientsAccess = require('../../app/methods/revoke-all-clients-access')
const R = require('ramda')

chai.use(chaiAsPromised)

const MONGO_URI = 'mongodb://localhost/sitegate-user-tests'

let fakeUser = {
  username: 'sherlock',
  email: 'sherlock@holmes.uk',
  password: '123456',
  provider: 'local',
}

describe('revokeAllClientsAccess', function() {
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

  it('should revoke client access if it is trusted by the user', function() {
    return this._server
      .register([
        {
          register: helpers.userCreator(R.merge(fakeUser, {
            trustedClients: [
              '507f191e810c19929de860ea',
              '507f191e810c19929de860eb',
            ],
          })),
        },
        {
          register: revokeAllClientsAccess,
        },
      ])
      .then(() => this._server.methods.revokeAllClientsAccess({
        userId: this._server.fakeUser.id,
      }))
      .then(user => {
        expect(user.trustedClients.length).to.eq(0)
      })
  })
})
