import app from '../../server/app'

describe('CRUD operation on \'CollectionType\' model', () => {
  const model = app.service('collection-type').Model

  it('Create', async done => {
    await model.create({
      type: 'test'
    })
  })

  it('Read', async done => {
    await model.findOne({
      where: {
        type: 'test'
      }
    })
  })

  it('Delete', async done => {
    await model.destroy({
      where: { type: 'test' }
    })
  })
})
