import app from '../../packages/server/src/app'

describe("'UploadMedia' service", () => {
  it('registered the service', () => {
    const service = app.service('media')

    expect(service).toBeTruthy()
  })
})
