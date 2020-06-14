import app from '../../server/app'

describe('CRUD operation on \'License\' model', () => {
  const model = app.service('license').Model

<<<<<<< HEAD
  it('Create', () => {
    model.create({
      name: 'test',
      text: 'text'
    })
  })

  it('Read', () => {
=======
  it('Create', done => {
    model.create({
      name: 'test',
      text: 'text'
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
      { text: 'text2' },
      { where: { name: 'test' } }
    )
  })

  it('Delete', () => {
    model.destroy({
      where: { name: 'test' }
    })
=======
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { text: 'text2' },
      { where: { name: 'test' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { name: 'test' }
    }).then(res => {
      done()
    }).catch(done)
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
  })
})
