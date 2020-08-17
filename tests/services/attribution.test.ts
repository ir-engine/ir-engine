import app from '../../packages/server/app'

describe('\'attribution\' service', () => {
  it('registered the service', () => {
    const service = app.service('attribution')

    expect(service).toBeTruthy()
  })
})
