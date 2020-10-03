import app from '../../packages/server/src/app'
import { v1 } from 'uuid'

describe('CRUD operation on \'Component\' model', () => {
  const model = app.service('component').Model
  const componentTypeModel = app.service('component-type').Model
  const entityModel = app.service('entity').Model
  const entityTypeModel = app.service('entity-type').Model
  const newEntityType = 'newType'
  const newComponentType = 'testcomponenttype'
  const newEntityName = 'testentitytype'

  let entityType: any
  let componentType: any
  let entityId: any

  beforeAll(async (done) => {
    await entityModel.destroy({
      where: {
        name: newEntityName
      }
    })
    await entityTypeModel.destroy({
      where: {
        type: newEntityType
      }
    })
    await componentTypeModel.destroy({
      where: {
        type: newComponentType
      }
    })
    const entityTypeModelInstance = await entityTypeModel.create({
      type: newEntityType
    })

    entityType = entityTypeModelInstance.type

    const entityModelInstance = await entityModel.create({
      name: newEntityType,
      entityId: v1(),
      entityType: entityType
    })

    const componentTypeModelInstance = await componentTypeModel.create({
      type: newComponentType
    })

    entityId = entityModelInstance.id
    componentType = componentTypeModelInstance.type
    done()
  })

  const input = {
    data: JSON.stringify({ data: 'test' }),
    componentType: componentType,
    entityId: entityId
  }
  it('Create', () => {
    model.create(input)
  })

  it('Read', () => {
    model.findOne({
      where: {
        entityId: entityId
      }
    })
  })

  it('Update', () => {
    model.update(
      { data: JSON.stringify({ data: 'test2' }) },
      { where: { entityId: entityId } }
    )
  })

  it('Delete', () => {
    model.destroy({
      where: { entityId: entityId }
    })
  })

  afterAll(async () => {
    await entityModel.destroy({
      where: {
        id: entityId
      }
    })
    await entityTypeModel.destroy({
      where: {
        type: entityType
      }
    })
    await componentTypeModel.destroy({
      where: {
        type: componentType
      }
    })
  })
})
