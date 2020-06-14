import app from '../../server/app'

describe('CRUD operation on \'Static Resource Type\' model', () => {
  const model = app.service('static-resource-type').Model

  it('Create', (done) => {
    model.create({
      type: 'test'
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', () => {
    model.findOne({
      where: {
        type: 'test'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', () => {
    model.destroy({
      where: { type: 'test' }
    }).then(res => {
      done()
    }).catch(done)
  })
})
