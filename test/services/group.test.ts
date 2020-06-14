import app from '../../server/app'

describe('\'Group\' service', () => {
  it('registered the service', () => {
    const service = app.service('group')
    expect(service).toBeTruthy()
  })
})
