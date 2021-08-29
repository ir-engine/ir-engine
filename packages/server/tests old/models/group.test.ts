import app from '../../packages/server/src/app'

describe('CRUD operation on \'Group\' model', () => {
  const model = (app.service('group') as any).Model

  it('Create', () => {
    model.create({
      name: 'test'
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
      { name: 'test1' },
      { where: { name: 'test' } }
    )
  })

  it('Delete', () => {
    model.destroy({
      where: { name: 'test1' }
    })
  })
})
