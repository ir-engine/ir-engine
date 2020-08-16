import app from '../../app'

describe('\'UploadMedia\' service', () => {
  it('registered the service', () => {
    const service = app.service('media')

    expect(service).toBeTruthy()
  })
})
