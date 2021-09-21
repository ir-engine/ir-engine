import app from '../../packages/server/src/app'

describe('CRUD operation on \'Location\' model', () => {
  const model = (app.service('location') as any).Model

  beforeAll(async () => {
    await model.destroy({
      where: {
        name: 'model-test'
      }
    })
  })

  it('Create', async () => {
    console.log('CREATE')
    console.log(model)
    await model.create({
      name: 'model-test',
      slugifiedName: 'model-test',
      maxUsersPerInstance: 10
    })
  })

  it('Read', async () => {
    await model.findOne({
      where: {
        name: 'model-test'
      }
    })
  })

  it('Update', async () => {
    await model.update(
      { maxUsersPerInstance: 11 },
      { where: { name: 'model-test' } }
    )
  })

  it('Delete', async () => {
    await model.destroy({
      where: { name: 'model-test' }
    })
  })
})
