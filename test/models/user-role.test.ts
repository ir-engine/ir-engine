import app from '../../src/app'

describe('CRUD operation on \'UserRole\' model', () => {
  const model = app.service('user-role').Model
  let roleId: any

  it('Create', done => {
    model.create({}).then(res => {
      roleId = res.id
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        id: roleId
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { id: roleId }
    }).then(res => {
      done()
    }).catch(done)
  })
})
