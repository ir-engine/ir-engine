import app from '../../src/app'

describe('CRUD operation on \'Component\' model', () => {
  const model = app.service('component').Model
  const componentTypeModel = app.service('component-type').Model
  const entityModel = app.service('entity').Model

  let componentType: any
  let entityId: any

  before(async () => {
    const entityModelInstance = await entityModel.create()

    const componentTypeModelInstance = await componentTypeModel.create({
      type: 'test'
    })

    entityId = entityModelInstance.id

    componentType = componentTypeModelInstance.type
  })

  const input = {
    data: JSON.stringify({ data: 'test' }),
    type: componentType,
    entityId: entityId
  }
  it('Create', done => {
    model.create(input).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        entityId: entityId
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { data: JSON.stringify({ data: 'test2' }) },
      { where: { entityId: entityId } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { entityId: entityId }
    }).then(res => {
      done()
    }).catch(done)
  })

  after(async () => {
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
