import app from '../../server/app'

describe('CRUD operation on \'Entity\' model', () => {
  const model = app.service('entity').Model
  const entityTypeModel = app.service('entity-type').Model
  let entityType: any

  beforeAll(async () => {
    const entity = await entityTypeModel.create({
      type: 'test_entity_type'
    })
    entityType = entity.type
  })

  it('Create', async () => {
    await model.create({
      name: 'test',
      entityType: entityType
    })
  })

  it('Read', async () => {
    await model.findOne({
      where: {
        entityType: entityType
      }
    })
  })

  it('Update', async () => {
    await model.update(
      { name: 'test1' },
      { where: { entityType: entityType } }
    )
  })

  it('Delete', async () => {
    await model.destroy({
      where: { entityType: entityType }
    })
  })

  afterAll(async () => {
    await entityTypeModel.destroy({
      where: {
        type: entityType
      }
    })
  })
})
