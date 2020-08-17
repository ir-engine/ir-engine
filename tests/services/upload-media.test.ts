import app from '../../packages/server/app'

describe('\'UploadMedia\' service', () => {
  it('registered the service', () => {
    const service = app.service('media')

    expect(service).toBeTruthy()
  })
})
