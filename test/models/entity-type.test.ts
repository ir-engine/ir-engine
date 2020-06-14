import app from '../../server/app'

describe('CRUD operation on \'Entity Type\' model', () => {
  const model = app.service('entity-type').Model

<<<<<<< HEAD
  it('Create', () => {
    model.create({
      type: 'test'
    })
  })

  it('Read', () => {
=======
  it('Create', done => {
    model.create({
      type: 'test'
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    model.findOne({
      where: {
        type: 'test'
      }
<<<<<<< HEAD
    })
  })

  it('Delete', () => {
    model.destroy({
      where: { type: 'test' }
    })
=======
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { type: 'test' }
    }).then(res => {
      done()
    }).catch(done)
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
  })
})
