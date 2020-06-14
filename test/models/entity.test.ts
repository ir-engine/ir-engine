import app from '../../server/app'

describe('CRUD operation on \'Entity\' model', () => {
  const model = app.service('entity').Model
  const entityTypeModel = app.service('entity-type').Model
  let entityType: any

  beforeEach(async () => {
    const entity = await entityTypeModel.create({
      type: 'test_entity_type'
    })
    entityType = entity.type
  })

  it('Create', async done => {
    await model.create({
      name: 'test',
      entityType: entityType
    })
  })

  it('Read', async done => {
    await model.findOne({
      where: {
        entityType: entityType
      }
    })
  })

  it('Update', async done => {
    await model.update(
      { name: 'test1' },
      { where: { entityType: entityType } }
    )
  })

  it('Delete', async done => {
    await model.destroy({
      where: { entityType: entityType }
    })
  })

  afterEach(async () => {
    await entityTypeModel.destroy({
      where: {
        type: entityType
      }
    })
  })
})
