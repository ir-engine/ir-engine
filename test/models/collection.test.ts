import app from '../../src/app'

describe('CRUD operation on \'Collection\' model', () => {
  const model = app.service('collection').Model
  const collectionTypeModel = app.service('collection-type').Model
  let collectionType: any

  before(async () => {
    setTimeout(() => {
      console.log('Waited for thirty seconds before test started.')
    }, 30000)
    const collection = await collectionTypeModel.create({
      type: 'test_collection'
    })
    collectionType = collection.type
  })

  it('Create', done => {
    model.create({
      name: 'test',
      description: 'test description',
      metadata: JSON.stringify({ a: 'test' }),
      isPublic: true,
      type: collectionType
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        name: 'test'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { description: 'test1 description' },
      { where: { name: 'test' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { name: 'test' }
    }).then(res => {
      done()
    }).catch(done)
  })

  after(async () => {
    collectionTypeModel.destroy({
      where: {
        type: collectionType
      }
    })
  })
})
