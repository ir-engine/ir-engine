import app from '../../src/app'

describe('CRUD operation on \'User Relationship Type\' model', () => {
  const model = app.service('user-relationship-type').Model

  const type = 'testType'

  it('Create', (done) => {
    model.create({
      type
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        type
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { type }
    }).then(res => {
      done()
    }).catch(done)
  })
})
