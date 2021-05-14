import app from '../../packages/server/src/app'

describe('CRUD operation on \'Static Resource\' model', () => {
  const model = (app.service('static-resource') as any).Model

  it('Create', () => {
    model.create({
      name: 'test',
      description: 'description',
      url: 'https://127.0.0.1:3030',
      mimeType: 'image/png',
      metadata: JSON.stringify({ data: 'test' })
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
      { description: 'description2' },
      { where: { name: 'test' } }
    )
  })

  it('Delete', () => {
    model.destroy({
      where: { name: 'test' }
    })
  })
})
