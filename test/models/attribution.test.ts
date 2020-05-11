import app from '../../src/app'

describe('CRUD operation on \'Attribution\' model', () => {
  const model = app.service('attribution').Model

  before(async () => {
    setTimeout(() => {
      console.log('Waited for one second before test started.')
    }, 1000)
  })

  it('Create', done => {
    model.create({
      creator: 'test',
      url: 'http://localhost:3030'
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        creator: 'test'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { creator: 'test1' },
      { where: { creator: 'test' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { creator: 'test1' }
    }).then(res => {
      done()
    }).catch(done)
  })
})
