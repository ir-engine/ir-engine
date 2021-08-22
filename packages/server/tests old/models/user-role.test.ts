import app from '../../packages/server/src/app'

describe('CRUD operation on \'UserRole\' model', () => {
  const model = (app.service('user-role') as any).Model
  const role: string = 'testrole'

  beforeAll(async () => {
    await model.destroy({
      where: {
        role: role
      }
    })
  })

  it('Create', async () => {
    await model.create({
      role: role
    })
  })

  it('Read', async () => {
    await model.findOne({
      where: { role }
    })
  })

  it('Delete', async () => {
    await model.destroy({
      where: { role }
    })
  })
})
