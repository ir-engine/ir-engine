import app from '../../src/app'

describe('CRUD operation on \'Static Resource\' model', () => {
  const model = app.service('static-resource').Model

  it('Create', (done) => {
    model.create({
      name: 'test',
      description: 'description',
      url: 'http://localhost:3030',
      mimeType: 'image/png',
      metadata: JSON.stringify({ data: 'test' })
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        name: 'test'
      }
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
  })
})
