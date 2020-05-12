import app from '../../src/app'

describe('CRUD operation on \'Project\' model', () => {
  const model = app.service('project').Model

  it('Create', (done) => {
    model.create({
      name: 'test project'
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        name: 'test project'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { type: 'model' },
      { where: { name: 'test project' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { name: 'test project' }
    }).then(res => {
      done()
    }).catch(done)
  })
})
