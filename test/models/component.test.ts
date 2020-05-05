import app from '../../src/app'

describe('CRUD operation on \'Component\' model', () => {
  const model = app.service('component').Model
  const input = {
    id: Math.random(),
    data: JSON.stringify({ data: 'test' })
  }
  it('Create', done => {
    model.create(input).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        id: input.id
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { data: JSON.stringify({ data: 'test2' }) },
      { where: { id: input.id } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { id: input.id }
    }).then(res => {
      done()
    }).catch(done)
  })
})
