import app from '../../src/app'

describe('CRUD operation on \'User Relationship Type\' model', () => {
  const model = app.service('user-relationship-type').Model

  it('Create', function (done) {
    model.create({
      type: 'test'
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        type: 'test'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { type: 'test1' },
      { where: { type: 'test' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { type: 'test' }
    }).then(res => {
      done()
    }).catch(done)
  })
})
