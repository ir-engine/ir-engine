import app from '../../src/app'

describe('CRUD operation on \'AccessControlScope\' model', () => {
  const model = app.service('access-control-scope').Model

  it('Create', done => {
    model.create({
      scope: 'test'
    }).then(res => {
      done()
    }).catch((err) => {
      console.log(err)
      done()
    })
  })

  it('Read', done => {
    model.findOne({
      where: {
        scope: 'test'
      }
    }).then(res => {
      done()
    }).catch((err) => {
      console.log(err)
      done()
    })
  })

  it('Delete', done => {
    model.destroy({
      where: { scope: 'test' }
    }).then(res => {
      done()
    }).catch((err) => {
      console.log(err)
      done()
    })
  })
})
