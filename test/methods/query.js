'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const query = require('../../app/methods/query')
const R = require('ramda')

chai.use(chaiAsPromised)

const MONGO_URI = 'mongodb://localhost/sitegate-user-tests'

let fakeUser = {
  username: 'sherlock',
  email: 'sherlock@holmes.uk',
  password: '123456',
  provider: 'local',
}

describe('query', function() {
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

  it('should users', function() {
    return this._server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: helpers.userCreator({
            username: 'bond',
            email: 'james@bond.uk',
            provider: 'local',
          }),
        },
        {
          register: query,
        },
      ])
      .then(() => this._server.methods.query({
        count: 2,
      }))
      .then(users => {
        expect(users.length).to.eq(2)
      })
  })
})
