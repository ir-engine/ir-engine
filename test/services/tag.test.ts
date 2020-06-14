<<<<<<< HEAD
import assert from 'assert'
=======
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
import app from '../../server/app'

describe('\'tag\' service', () => {
  it('registered the service', () => {
    const service = app.service('tag')
    expect(service).toBeTruthy()
  })
})
