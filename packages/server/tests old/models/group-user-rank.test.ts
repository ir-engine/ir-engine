import app from '../../packages/server/src/app'

describe("CRUD operation on 'GroupUserRank' model", () => {
  const model = (app.service('group-user-rank') as any).Model

  beforeAll(async (done) => {
    await model.destroy({
      where: { rank: 'test' }
    })
    done()
  })

  it('Create', async () => {
    await model.create({
      rank: 'test'
    })
  })

  it('Read', async () => {
    await model.findOne({
      where: {
        rank: 'test'
      }
    })
  })

  it('Update', async () => {
    await model.update({ rank: 'test' }, { where: { rank: 'test' } })
  })

  it('Delete', async () => {
    await model.destroy({
      where: { rank: 'test' }
    })
  })
})
