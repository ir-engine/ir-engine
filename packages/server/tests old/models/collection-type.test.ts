import app from '../../packages/server/src/app'

describe('CRUD operation on \'CollectionType\' model', () => {
  const model = (app.service('collection-type') as any).Model

  beforeAll(async () => {
    await model.destroy({
      where: {
        type: 'test'
      }
    })
  })

  it('Create', async () => {
    await model.create({
      type: 'test'
    })
  })

  it('Read', async () => {
    await model.findOne({
      where: {
        type: 'test'
      }
    })
  })

  it('Delete', async () => {
    await model.destroy({
      where: { type: 'test' }
    })
  })
})
