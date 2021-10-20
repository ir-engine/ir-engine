import app from '../../packages/server/src/app'
import { v1 } from 'uuid'

describe('CRUD operation on \'Component\' model', () => {
  const model = (app.service('component') as any).Model
  const componentTypeModel = (app.service('component-type') as any).Model
  const entityModel = (app.service('entity') as any).Model
  const newComponentType = 'testcomponenttype'
  const newEntityName = 'testentitytype'

  let componentType: any
  let entityId: any

  beforeAll(async (done) => {
    await entityModel.destroy({
      where: {
        name: newEntityName
      }
    })
    await componentTypeModel.destroy({
      where: {
        type: newComponentType
      }
    })

    const entityModelInstance = await entityModel.create({
      name: newEntityName,
      entityId: v1(),
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
    await componentTypeModel.destroy({
      where: {
        type: componentType
      }
    })
  })
})
