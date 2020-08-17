import app from '../../packages/server/app'

describe('\'Entity\' service', () => {
  it('registered the service', () => {
    const service = app.service('entity')
    expect(service).toBeTruthy()
  })
})
