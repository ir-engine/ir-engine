import app from '../../packages/server/src/app'

describe('CRUD operation on \'Location\' model', () => {
  const model = app.service('location').Model

  beforeAll(async () => {
    await model.destroy({
      where: {
        name: 'test'
      }
    })
  })

  it('Create', async () => {
    console.log('CREATE')
    console.log(model)
    await model.create({
      name: 'test',
      maxUsersPerInstance: 10
    })
  })

  it('Read', async () => {
    await model.findOne({
      where: {
        name: 'test'
      }
    })
  })

  it('Update', async () => {
    await model.update(
      { maxUsersPerInstance: 11 },
      { where: { name: 'test' } }
    )
  })

  it('Delete', async () => {
    await model.destroy({
      where: { name: 'test' }
    })
  })
})
