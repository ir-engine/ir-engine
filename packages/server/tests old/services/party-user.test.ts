import app from '../../packages/server/src/app'

describe("'PartyUser' service", () => {
  it('registered the service', () => {
    const service = app.service('party-user')

    expect(service).toBeTruthy()
  })
})
