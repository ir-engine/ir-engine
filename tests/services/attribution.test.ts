import app from '../../packages/server/src/app'

describe('\'attribution\' service', () => {
  it('registered the service', () => {
    const service = app.service('attribution')

    expect(service).toBeTruthy()
  })
})
