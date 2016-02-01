'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const plugiator = require('plugiator')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const getById = require('../../app/methods/get-by-id')
const getTrustedClients = require('../../app/methods/get-trusted-clients')
const R = require('ramda')

chai.use(chaiAsPromised)

const MONGO_URI = 'mongodb://localhost/sitegate-user-tests'

let fakeUser = {
  username: 'sherlock',
  email: 'sherlock@holmes.uk',
  password: '123456',
  provider: 'local',
}

describe('getTrustedClients', function() {
  let server

  beforeEach(mongotest.prepareDb(MONGO_URI));
  beforeEach(function() {
    server = jimbo()

    return server.register([
      {
        register: modelsPlugin,
        options: {
          mongoURI: MONGO_URI,
        },
      },
    ])
  })
  afterEach(mongotest.disconnect());

  it('should return trusted clients of a user', function() {
    let trustedClientIds = [
      'bbc9157c0a064b94b2eb131b',
      'f5c481eec10d4e979caac94a',
      '56230147a4d940f9bfa6e31d',
    ]
    return server
      .register([
        {
          register: helpers.userCreator(R.merge(fakeUser, {
            trustedClients: trustedClientIds,
          })),
        },
        {
          register: plugiator.create('jimbo-client', (server, opts) => {
            server.expose('client', {
              query(params) {
                expect(params.ids.length).eql(trustedClientIds.length)
                return ['result']
              },
            })
          }),
        },
        {
          register: getById,
        },
        {
          register: getTrustedClients,
        },
      ])
      .then(() => server.methods.getTrustedClients({
        userId: server.fakeUser.id,
      }))
      .then(clients => {
        expect(clients).to.eql(['result'])
      })
  })
})
