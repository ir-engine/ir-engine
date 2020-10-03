import app from '../../packages/server/src/app'

describe('CRUD operation on \'Entity Type\' model', () => {
  const model = app.service('entity-type').Model

  it('Create', () => {
    model.create({
      type: 'test'
    })
  })

  it('Read', () => {
    model.findOne({
      where: {
        type: 'test'
      }
    })
  })

  it('Delete', () => {
    model.destroy({
      where: { type: 'test' }
    })
  })
})
