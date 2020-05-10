import app from '../../src/app'

describe('CRUD operation on \'Party\' model', () => {
  const model = app.service('party').Model

  it('Create', done => {
    model.create({}).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findAll().then(res => {
      done()
    }).catch(done)
  })
})
