import app from '../../packages/server/app'

describe('\'Group\' service', () => {
  it('registered the service', () => {
    const service = app.service('group')
    expect(service).toBeTruthy()
  })
})
