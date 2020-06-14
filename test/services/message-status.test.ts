<<<<<<< HEAD
import assert from 'assert'
=======
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
import app from '../../server/app'

describe('\'message-status\' service', () => {
  it('registered the service', () => {
    const service = app.service('message-status')

    expect(service).toBeTruthy()
  })
})
