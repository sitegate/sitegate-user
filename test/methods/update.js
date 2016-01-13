'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const getById = require('../../app/methods/get-by-id')
const update = require('../../app/methods/update')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const joi = require('joi')
const plugiator = require('plugiator')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(chaiAsPromised)
chai.use(sinonChai)

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

describe('update', function() {
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

  it('should update user', function() {
    let spy = sinon.spy((params, cb) => cb())
    return this._server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: plugiator.create('send-verification-email', (server, opts, next) => {
            server.method({
              name: 'sendVerificationEmail',
              config: {
                validate: {
                  userId: joi.string(),
                },
              },
              handler: spy,
            })

            next()
          }),
        },
        {
          register: update,
        },
      ])
      .then(() => this._server.methods
        .update({
          id: fakeUser.id,
          username: 'new-username',
          email: 'some.new.email@gmail.com',
        }))
      .then(result => {
        expect(spy).to.have.been.calledOnce
        expect(result.user).to.exist
        expect(result.user.id).to.exist
        expect(result.user.username).to.eq('new-username')
        expect(result.user.email).to.eq('some.new.email@gmail.com')
        expect(result.emailHasBeenUpdated).to.be.true
      })
  })
})
