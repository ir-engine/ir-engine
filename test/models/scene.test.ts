import app from '../../src/app'

describe('CRUD operation on \'Scene\' model', () => {
  const model = app.service('scene').Model

  it('Create', function (done) {
    model.create({
      blobId: 'test'
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        blobId: 'test'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { blobId: 'test1' },
      { where: { blobId: 'test' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { blobId: 'test' }
    }).then(res => {
      done()
    }).catch(done)
  })
})
