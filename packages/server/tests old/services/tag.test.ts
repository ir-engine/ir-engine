import app from '../../packages/server/src/app'

describe("'tag' service", () => {
  it('registered the service', () => {
    const service = app.service('tag')
    expect(service).toBeTruthy()
  })
})
