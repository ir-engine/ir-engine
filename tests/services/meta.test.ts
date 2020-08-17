import app from '../../packages/server/app'

describe('\'Meta\' service', () => {
  it('registered the service', () => {
    const service = app.service('meta')

    expect(service).toBeTruthy()
  })
})
