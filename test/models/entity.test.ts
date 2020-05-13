import app from '../../src/app'

describe('CRUD operation on \'Entity\' model', () => {
  const model = app.service('entity').Model
  const entityTypeModel = app.service('entity-type').Model
  let entityType: any

  before(async () => {
    const entity = await entityTypeModel.create({
      type: 'test_entity_type'
    })
    entityType = entity.type
  })

  it('Create', done => {
    model.create({
      name: 'test',
      type: entityType
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        type: entityType
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { name: 'test1' },
      { where: { type: entityType } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { type: entityType }
    }).then(res => {
      done()
    }).catch(done)
  })

  after(async () => {
    entityTypeModel.destroy({
      where: {
        type: entityType
      }
    })
  })
})
