import app from '../../server/app'

describe('CRUD operation on \'User Relationship Type\' model', () => {
  const model = app.service('user-relationship-type').Model

  const type = 'testType'

  it('Create', async done => {
    await model.create({
      type
    })
  })

  it('Read', async done => {
    await model.findOne({
      where: {
        type
      }
    })
  })

  it('Delete', async done => {
    await model.destroy({
      where: { type }
    })
  })
})
