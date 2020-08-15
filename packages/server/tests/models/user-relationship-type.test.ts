import app from '../../server/app'

describe('CRUD operation on \'User Relationship Type\' model', () => {
  const model = app.service('user-relationship-type').Model

  const type = 'testType'

  it('Create', async () => {
    await model.create({
      type
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
