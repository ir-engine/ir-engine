import app from '../../server/app'

describe('\'GraphQL\' service', () => {
  it('registered the service', () => {
    const service = app.service('graphql')
    expect(service).toBeTruthy()
  })
})
