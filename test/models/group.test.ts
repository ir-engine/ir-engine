import app from '../../server/app'

describe('CRUD operation on \'Group\' model', () => {
  const model = app.service('group').Model

<<<<<<< HEAD
  it('Create', () => {
    model.create({
      name: 'test'
    })
  })

  it('Read', () => {
=======
  it('Create', done => {
    model.create({
      name: 'test'
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    model.findOne({
      where: {
        name: 'test'
      }
<<<<<<< HEAD
    })
  })

  it('Update', () => {
    model.update(
      { name: 'test1' },
      { where: { name: 'test' } }
    )
  })

  it('Delete', () => {
    model.destroy({
      where: { name: 'test1' }
    })
=======
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { name: 'test1' },
      { where: { name: 'test' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { name: 'test1' }
    }).then(res => {
      done()
    }).catch(done)
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
  })
})
