import app from '../../server/app'

describe('CRUD operation on \'UserSetting\' model', () => {
  const model = app.service('user-settings').Model
  const userModel = app.service('user').Model
  let userId: any

<<<<<<< HEAD
  beforeAll(async () => {
=======
  beforeEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    const user = await userModel.create({})
    userId = user.id
  })

<<<<<<< HEAD
  it('Create', async () => {
=======
  it('Create', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.create({
      microphone: '.5',
      audio: '.5',
      userId: userId
    })
  })

<<<<<<< HEAD
  it('Read', async () => {
=======
  it('Read', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.findOne({
      where: {
        userId: userId
      }
    })
  })

<<<<<<< HEAD
  it('Update', async () => {
=======
  it('Update', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.update(
      {
        microphone: '.8'
      },
      {
        where: {
          userId: userId
        }
      })
  })

<<<<<<< HEAD
  it('Delete', async () => {
=======
  it('Delete', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.destroy({
      where: { userId: userId }
    })
  })

<<<<<<< HEAD
  afterAll(async () => {
=======
  afterEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await userModel.destroy({
      where: {
        id: userId
      }
    })
  })
})
