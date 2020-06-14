import app from '../../server/app'

describe.skip('CRUD operation on \'Collection\' model', () => {
  const model = app.service('collection').Model
  const collectionTypeModel = app.service('collection-type').Model
  let collectionType: any

<<<<<<< HEAD
  beforeAll(async () => {
=======
  beforeEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    const collection = await collectionTypeModel.create({
      type: 'test_collection'
    })
    collectionType = collection.type
  })

<<<<<<< HEAD
  it('Create', () => {
=======
  it('Create', done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    model.create({
      name: 'test',
      description: 'test description',
      metadata: JSON.stringify({ a: 'test' }),
      isPublic: true,
      type: collectionType
    })
  })

<<<<<<< HEAD
  it('Read', () => {
=======
  it('Read', done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    model.findOne({
      where: {
        name: 'test'
      }
<<<<<<< HEAD
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
=======
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

  afterEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    collectionTypeModel.destroy({
      where: {
        type: collectionType
      }
    })
  })
})
