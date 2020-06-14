import app from '../../server/app'

describe('CRUD operation on \'UserRole\' model', () => {
  const model = app.service('user-role').Model
  let role: string = 'testrole'

  it('Create', async done => {
    await model.create({
      role
    })
  })

  it('Read', async done => {
    await model.findOne({
      where: { role }
    })
  })

  it('Delete', async done => {
    await model.destroy({
      where: { role }
    })
  })
})
