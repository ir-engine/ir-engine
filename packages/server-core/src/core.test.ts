import assert from 'assert'
import app from "../../server/src/app"


describe('Core', () => {

  it('should initialise app', async () => {
    assert.doesNotReject(app.isSetup)
  })

})