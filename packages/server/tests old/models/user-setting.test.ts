import app from '../../packages/server/src/app'

describe("CRUD operation on 'UserSetting' model", () => {
  const model = (app.service('user-settings') as any).Model
  const userModel = (app.service('user') as any).Model
  let userId: any

  beforeAll(async () => {
    const user = await userModel.create({})
    userId = user.id
  })

  it('Create', async () => {
    await model.create({
      microphone: '.5',
      audio: '.5',
      userId: userId
    })
  })

  it('Read', async () => {
    await model.findOne({
      where: {
        userId: userId
      }
    })
  })

  it('Update', async () => {
    await model.update(
      {
        microphone: '.8'
      },
      {
        where: {
          userId: userId
        }
      }
    )
  })

  it('Delete', async () => {
    await model.destroy({
      where: { userId: userId }
    })
  })

  afterAll(async () => {
    await userModel.destroy({
      where: {
        id: userId
      }
    })
  })
})
