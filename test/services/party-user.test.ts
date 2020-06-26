import app from '../../server/app'

describe('\'PartyUser\' service', () => {
  it('registered the service', () => {
    const service = app.service('party-user')

    expect(service).toBeTruthy()
  })
})
