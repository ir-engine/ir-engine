import app from '../../server/app'

describe('CRUD operation on \'Group\' model', () => {
  const model = app.service('group').Model

  it('Create', () => {
    model.create({
      name: 'test'
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', () => {
    model.findOne({
      where: {
        name: 'test'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', () => {
    model.update(
      { name: 'test1' },
      { where: { name: 'test' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', () => {
    model.destroy({
      where: { name: 'test1' }
    }).then(res => {
      done()
    }).catch(done)
  })
})
