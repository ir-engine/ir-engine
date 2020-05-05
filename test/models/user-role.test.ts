import app from '../../src/app'

describe('CRUD operation on \'UserRole\' model', () => {
  const model = app.service('user-role').Model

  it('Create', function (done) {
    model.create({
      role: 'test'
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        role: 'test'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { role: 'test1' },
      { where: { role: 'test' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { role: 'test' }
    }).then(res => {
      done()
    }).catch(done)
  })
})
