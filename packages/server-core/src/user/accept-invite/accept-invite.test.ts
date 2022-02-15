import assert from 'assert'
import sinon from 'sinon'
import { v1 } from 'uuid'
import { Application } from '../../../declarations'
import { AcceptInvite } from './accept-invite.class'

describe.only('accept-invite.class tests', () => {
  it('constructor is called', async () => {
    // Mock
    const app = {} as Application
    const option = {}

    // Act
    const acceptInvite = new AcceptInvite(option, app)

    // Assert
    assert.ok(acceptInvite, 'Constructor called')
    assert.equal(acceptInvite.app, app)
    assert.equal(acceptInvite.options, option)
  })

  it('call setup method', async () => {
    // Mock
    const app = {} as Application
    const option = {}

    // Act & Assert
    const acceptInvite = new AcceptInvite(option, app)
    assert.doesNotThrow(async () => await acceptInvite.setup())
  })

  it('call find method', async () => {
    // Mock
    const app = {} as Application
    const option = {}

    // Act
    const acceptInvite = new AcceptInvite(option, app)
    const data = await acceptInvite.find()

    // Assert
    assert.ok(data, 'Find method called')
  })

  it('call get method', async () => {
    // Mock
    const app = {} as Application
    const option = {}
    const inviteId = v1()
    const passcode = v1()
    const token = v1()
    const params = {
      query: {
        passcode
      },
      'identity-provider': {
        id: v1()
      }
    }
    const service = sinon.stub()
    service.withArgs('invite').returns({
      get: sinon.stub().returns({
        passcode
      }),
      remove: sinon.stub()
    })
    service.withArgs('authentication').returns({
      createAccessToken: sinon.stub().returns(token)
    })
    app.service = service

    // Act
    const acceptInvite = new AcceptInvite(option, app)
    const data = await acceptInvite.get(inviteId, params)

    // Assert
    assert.ok(data, 'Get method called')
  })
})
