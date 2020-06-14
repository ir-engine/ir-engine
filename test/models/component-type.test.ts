import app from '../../server/app'

describe('CRUD operation on \'Component Type\' model', () => {
  const model = app.service('component-type').Model

  it('Create', async done => {
    await model.create({
      type: 'test'
    })
  })

  it('Read', async done => {
    await model.findOne({
      where: { type: 'test' }
    })
  })

  it('Delete', async done => {
    await model.destroy({
      where: { type: 'test' }
    })
  })
})
