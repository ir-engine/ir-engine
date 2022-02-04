import app from '../../packages/server/src/app'

describe("'Party' service", () => {
  it('registered the service', () => {
    const service = app.service('party')

    expect(service).toBeTruthy()
  })
})
