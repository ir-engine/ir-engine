import app from '../../server/app'

describe('CRUD operation on \'Location\' model', () => {
  const model = app.service('location').Model

  it('Create', async done => {
    await model.create({
      name: 'test',
      maxUsersPerInstance: 10
    })
  })

  it('Read', async done => {
    await model.findOne({
      where: {
        name: 'test'
      }
    })
  })

  it('Update', async done => {
    await model.update(
      { maxUsersPerInstance: 11 },
      { where: { name: 'test' } }
    )
  })

  it('Delete', async done => {
    await model.destroy({
      where: { name: 'test' }
    })
  })
})
