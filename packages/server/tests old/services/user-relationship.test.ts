import app from '../../packages/server/src/app'

describe("'UserRelationship' service", () => {
  it('registered the service', () => {
    const service = app.service('user-relationship')

    expect(service).toBeTruthy()
  })
})
