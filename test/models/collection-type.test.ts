import app from '../../src/app'

describe('CRUD operation on \'CollectionType\' model', () => {
  const model = app.service('collection-type').Model

  it('Create', done => {
    model.create({
      type: 'test'
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        type: 'test'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { type: 'test1' }
    }).then(res => {
      done()
    }).catch(done)
  })
})
