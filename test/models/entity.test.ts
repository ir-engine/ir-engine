import app from '../../server/app'

describe('CRUD operation on \'Entity\' model', () => {
  const model = app.service('entity').Model
  const entityTypeModel = app.service('entity-type').Model
  let entityType: any

<<<<<<< HEAD
  beforeAll(async () => {
=======
  beforeEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    const entity = await entityTypeModel.create({
      type: 'test_entity_type'
    })
    entityType = entity.type
  })

<<<<<<< HEAD
  it('Create', async () => {
=======
  it('Create', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.create({
      name: 'test',
      entityType: entityType
    })
  })

<<<<<<< HEAD
  it('Read', async () => {
=======
  it('Read', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.findOne({
      where: {
        entityType: entityType
      }
    })
  })

<<<<<<< HEAD
  it('Update', async () => {
=======
  it('Update', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.update(
      { name: 'test1' },
      { where: { entityType: entityType } }
    )
  })

<<<<<<< HEAD
  it('Delete', async () => {
=======
  it('Delete', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.destroy({
      where: { entityType: entityType }
    })
  })

<<<<<<< HEAD
  afterAll(async () => {
=======
  afterEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await entityTypeModel.destroy({
      where: {
        type: entityType
      }
    })
  })
})
