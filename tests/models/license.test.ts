import app from '../../packages/server/src/app'

describe('CRUD operation on \'License\' model', () => {
  const model = app.service('license').Model

  it('Create', () => {
    model.create({
      name: 'test',
      text: 'text'
    })
  })

  it('Read', () => {
    model.findOne({
      where: {
        name: 'test'
      }
    })
  })

  it('Update', () => {
    model.update(
      { text: 'text2' },
      { where: { name: 'test' } }
    )
  })

  it('Delete', () => {
    model.destroy({
      where: { name: 'test' }
    })
  })
})
