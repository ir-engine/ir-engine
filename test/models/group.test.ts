import app from '../../src/app'

describe('CRUD operation on \'Group\' model', () => {
  const model = app.service('group').Model

  before(async () => {
    setTimeout(() => {
      console.log('Waited thirty seconds before starting test.')
    }, 30000)
  })

  it('Create', done => {
    model.create({
      name: 'test'
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        name: 'test'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { name: 'test1' },
      { where: { name: 'test' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { name: 'test1' }
    }).then(res => {
      done()
    }).catch(done)
  })
})
