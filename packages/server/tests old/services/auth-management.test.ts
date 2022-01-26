import app from '../../packages/server/src/app'

describe("'AuthManagement' service", () => {
  it('registered the service', () => {
    const service = app.service('authManagement')

    expect(service).toBeTruthy()
  })
})
