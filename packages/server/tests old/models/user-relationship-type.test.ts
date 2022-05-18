import app from '../../packages/server/src/app'

describe('CRUD operation on \'User Relationship Type\' model', () => {
  const model = (app.service('user-relationship-type') as any).Model

  const type = 'testType'

  beforeAll(async () => {
    await model.destroy({
      where: {
        type: type
      }
    })
  })

  it('Create', async () => {
    await model.create({
      type: type
    })
  })

  it('Read', async () => {
    await model.findOne({
      where: {
        type: type
      }
    })
  })

  it('Delete', async () => {
    await model.destroy({
      where: {
        type: type
      }
    })
  })
})
