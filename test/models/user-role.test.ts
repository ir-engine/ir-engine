import app from '../../src/app'

describe('CRUD operation on \'UserRole\' model', () => {
  const model = app.service('user-role').Model
  let role: any

  it('Create', done => {
    model.create({
      role: 'testrole'
    }).then(res => {
      role = res.role
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: { role }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { role }
    }).then(res => {
      done()
    }).catch(done)
  })
})
