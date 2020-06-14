import app from '../../server/app'

describe('CRUD operation on \'Static Resource\' model', () => {
  const model = app.service('static-resource').Model

<<<<<<< HEAD
  it('Create', () => {
=======
  it('Create', (done) => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    model.create({
      name: 'test',
      description: 'description',
      url: 'http://localhost:3030',
      mimeType: 'image/png',
      metadata: JSON.stringify({ data: 'test' })
<<<<<<< HEAD
    })
  })

  it('Read', () => {
=======
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
      { description: 'description2' },
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
      { description: 'description2' },
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
