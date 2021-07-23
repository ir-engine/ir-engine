import app from '../../packages/server/src/app'

describe.skip('CRUD operation on \'Collection\' model', () => {
  const model = (app.service('collection') as any).Model
  const collectionTypeModel = (app.service('collection-type') as any).Model
  let collectionType: any

  beforeAll(async () => {
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
    })
  })

  it('Update', () => {
    model.update(
      { description: 'test1 description' },
      { where: { name: 'test' } }
    )
  })

  it('Delete', () => {
    model.destroy({
      where: { name: 'test' }
    })
  })

  afterAll(async () => {
    collectionTypeModel.destroy({
      where: {
        type: collectionType
      }
    })
  })
})
