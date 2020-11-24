import app from '../../packages/server/src/app'

describe('\'Group\' service', () => {
  it('registered the service', () => {
    const service = app.service('group')
    expect(service).toBeTruthy()
  })
})
