import app from '../../server/app'

describe('CRUD operation on \'License\' model', () => {
  const model = app.service('license').Model

  it('Create', () => {
    model.create({
      name: 'test',
      text: 'text'
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
      { text: 'text2' },
      { where: { name: 'test' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', () => {
    model.destroy({
      where: { name: 'test' }
    }).then(res => {
      done()
    }).catch(done)
  })
})
