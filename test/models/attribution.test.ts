import app from '../../server/app'

describe('CRUD operation on \'Attribution\' model', () => {
  const model = app.service('attribution').Model

  it('Create', async done => {
    await model.create({
      creator: 'test',
      url: 'http://localhost:3030'
    })
  })

  it('Read', async done => {
    await model.findOne({
      where: {
        creator: 'test'
      }
    })
  })

  it('Update', async done => {
    await model.update(
      { creator: 'test1' },
      { where: { creator: 'test' } }
    )
  })

  it('Delete', async done => {
    await model.destroy({
      where: { creator: 'test1' }
    })
  })
})
