import app from '../../packages/server/app'

describe('\'AuthManagement\' service', () => {
  it('registered the service', () => {
    const service = app.service('authManagement')

    expect(service).toBeTruthy()
  })
})
