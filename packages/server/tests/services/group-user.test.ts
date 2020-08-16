import app from '../../app'

describe('\'GroupUser\' service', () => {
  it('registered the service', () => {
    const service = app.service('group-user')
    expect(service).toBeTruthy()
  })
})
