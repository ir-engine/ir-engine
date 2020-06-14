import app from '../../server/app'

describe('CRUD operation on \'UserSetting\' model', () => {
  const model = app.service('user-settings').Model
  const userModel = app.service('user').Model
  let userId: any

  beforeEach(async () => {
    const user = await userModel.create({})
    userId = user.id
  })

  it('Create', async done => {
    await model.create({
      microphone: '.5',
      audio: '.5',
      userId: userId
    })
  })

  it('Read', async done => {
    await model.findOne({
      where: {
        userId: userId
      }
    })
  })

  it('Update', async done => {
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

  it('Delete', async done => {
    await model.destroy({
      where: { userId: userId }
    })
  })

  afterEach(async () => {
    await userModel.destroy({
      where: {
        id: userId
      }
    })
  })
})
