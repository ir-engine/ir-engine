import app from '../../packages/server/src/app'

describe("'GroupUserRank' service", () => {
  it('registered the service', () => {
    const service = app.service('group-user-rank')
    expect(service).toBeTruthy()
  })
})
