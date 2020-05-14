import app from '../../src/app'

describe('CRUD operation on \'Asset\' model', () => {
  const model = app.service('asset').Model

  it('Create', (done) => {
    model.create({
      name: 'test asset',
      type: 'image'
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        name: 'test asset'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { type: 'model' },
      { where: { name: 'test asset' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { name: 'test asset' }
    }).then(res => {
      done()
    }).catch(done)
  })
})
