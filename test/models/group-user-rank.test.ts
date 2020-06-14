import app from '../../server/app'

describe('CRUD operation on \'GroupUserRank\' model', () => {
  const model = app.service('group-user-rank').Model

  it('Create', async done => {
    await model.create({
      rank: 'test'
    })
  })

  it('Read', async done => {
    await model.findOne({
      where: {
        rank: 'test'
      }
    })
  })

  it('Update', async done => {
    await model.update(
      { rank: 'test' },
      { where: { rank: 'test' } }
    )
  })

  it('Delete', async done => {
    await model.destroy({
      where: { rank: 'test' }
    })
  })
})
