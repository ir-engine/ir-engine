import app from '../../app'

describe('CRUD operation on \'Attribution\' model', () => {
  const model = app.service('attribution').Model

  it('Create', async () => {
    await model.create({
      creator: 'test',
      url: 'https://localhost:3030'
    })
  })

  it('Read', async () => {
    await model.findOne({
      where: {
        creator: 'test'
      }
    })
  })

  it('Update', async () => {
    await model.update(
      { creator: 'test1' },
      { where: { creator: 'test' } }
    )
  })

  it('Delete', async () => {
    await model.destroy({
      where: { creator: 'test1' }
    })
  })
})
