import app from '../../server/app'

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

  it('Read', () => {
    model.findOne({
      where: {
        name: 'test'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', () => {
    model.update(
      { description: 'description2' },
      { where: { name: 'test' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', () => {
    model.destroy({
      where: { name: 'test' }
    }).then(res => {
      done()
    }).catch(done)
  })
})
