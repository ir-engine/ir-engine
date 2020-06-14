import app from '../../server/app'

describe.skip('CRUD operation on \'Collection\' model', () => {
  const model = app.service('collection').Model
  const collectionTypeModel = app.service('collection-type').Model
  let collectionType: any

  beforeEach(async () => {
    const collection = await collectionTypeModel.create({
      type: 'test_collection'
    })
    collectionType = collection.type
  })

  it('Create', () => {
    model.create({
      name: 'test',
      description: 'test description',
      metadata: JSON.stringify({ a: 'test' }),
      isPublic: true,
      type: collectionType
    })
  })

  it('Read', () => {
    model.findOne({
      where: {
        name: 'test'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', () => {
    model.update(
      { description: 'test1 description' },
      { where: { name: 'test' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', () => {
    model.destroy({
      where: { name: 'test' }
    }).then(res => {
      done()
    }).catch(done)
  })

  afterEach(async () => {
    collectionTypeModel.destroy({
      where: {
        type: collectionType
      }
    })
  })
})
