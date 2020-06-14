import app from '../../server/app'

describe('CRUD operation on \'UserRole\' model', () => {
  const model = app.service('user-role').Model
  let role: string = 'testrole'

  it('Create', async () => {
    await model.create({
      role
    })
  })

  it('Read', async () => {
    await model.findOne({
      where: { role }
    })
  })

  it('Delete', async () => {
    await model.destroy({
      where: { role }
    })
  })
})
