import app from '../../packages/server/src/app'

describe("CRUD operation on 'User' model", () => {
  const model = (app.service('user') as any).Model
  const userRoleModel = (app.service('user-role') as any).Model

  beforeAll(async (done) => {
    await userRoleModel.destroy({
      where: {
        role: 'testrole'
      }
    })
    await model.destroy({
      where: {
        name: 'test'
      }
    })
    await userRoleModel.create({
      role: 'testrole'
    })
    done()
  })

  it('Create', async () => {
    const createUser = await model.create({
      name: 'test',
      userRole: 'testrole'
    })
    expect(createUser.name).toBe('test')
    expect(createUser.userRole).toBe('testrole')
  })

  it('Read', async () => {
    const readUser = await model.findOne({
      where: {
        name: 'test',
        userRole: 'testrole'
      }
    })
    expect(readUser.name).toBe('test')
    expect(readUser.userRole).toBe('testrole')
  })

  it('Update', async () => {
    const name = 'name'
    await model.update(
      { name: name },
      {
        where: { name: 'test', userRole: 'testrole' }
      }
    )
    const updateUser = await model.findOne({
      where: {
        name: name,
        userrole: 'testrole'
      }
    })
    expect(updateUser.name).toBe(name)
    expect(updateUser.userRole).toBe('testrole')
  })

  it('Delete', async () => {
    const deleteUser = await model.destroy({
      where: { userRole: 'testrole' }
    })
    expect(deleteUser).toBeGreaterThan(0)
  })

  afterAll(async () => {
    await userRoleModel.destroy({
      where: {
        role: 'testrole'
      }
    })
  })
})
