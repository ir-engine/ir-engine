// TODO: Fix
// Create two users
// Create party with one user and verify that it fails
// Create party with two users and verify that it succeeds
// Remove one user and verify that the party is destroyed

import app from '../../server/app'

<<<<<<< HEAD
describe.skip('CRUD operation on \'Party\' model', () => {
  const model = app.service('party').Model
  const userModel = app.service('user').Model
  // const partyUserModel = app.service('party-user').Model
  let userId: any

  beforeAll(async () => {
    const user = await userModel.create({})
    userId = user.id
  })

  it('Create', () => {
    model.create({ userId: userId })
  })

  it('Read', async () => {
    model.findAll()
  })
=======
describe('CRUD operation on \'Party\' model', () => {
  //   const model = app.service('party').Model
  //   const userModel = app.service('user').Model
  // const partyUserModel = app.service('party-user').Model
  //   let userId: any

  //   beforeEach(async () => {
  //     const user = await userModel.create({})
  //     userId = user.id
  //   })

  //   it('Create', done => {
  //     model.create({ userId: userId }).then(res => {
  //       done()
  //     }).catch(done)
  //   })

  //   it('Read', async done => {
  //     model.findAll().then(res => {
  //       done()
  //     }).catch(done)
  //   })
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
})
