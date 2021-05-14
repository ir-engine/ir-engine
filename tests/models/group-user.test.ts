import app from '../../packages/server/src/app'

describe('CRUD operation on \'GroupUser\' model', () => {
  const model = (app.service('group-user') as any).Model
  const userModel = (app.service('user') as any).Model
  const userRoleModel = (app.service('user-role') as any).Model
  const groupModel = (app.service('group') as any).Model
  const groupUserRankModel = (app.service('group-user-rank') as any).Model
  const userName = 'testname'
  const groupUserRank = 'uberleader'
  const groupUserRankUpdated = 'updated-uberleader'
  const group = 'testgroup'
  const role = 'testrole'
  let userId: string
  let groupId: string

  beforeAll(async (done) => {
    await userModel.destroy({
      where: {
        name: userName
      }
    })

    await groupModel.destroy({
      where: {
        name: group
      }
    })

    await userRoleModel.destroy({
      where: {
        role: role
      }
    })

    await groupUserRankModel.destroy({
      where: {
        rank: groupUserRank
      }
    })

    await groupUserRankModel.destroy({
      where: {
        rank: groupUserRankUpdated
      }
    })

    await userRoleModel.create({
      role
    })

    await userModel.create({
      name: userName,
      userRole: role
    })

    await groupModel.create({
      name: group
    })

    await groupUserRankModel.create({
      rank: groupUserRank
    })

    await groupUserRankModel.create({
      rank: groupUserRankUpdated
    })

    const userModelInstance = await userModel.findOne({
      where: { name: userName }
    })

    userId = userModelInstance.id

    const groupModelInstance = await groupModel.findOne({
      where: { name: group }
    })

    groupId = groupModelInstance.id

    done()
  })

  it('Create', async () => {
    const createModel = await model.create({
      userId: userId,
      groupId: groupId,
      groupUserRank: groupUserRank
    })
    expect(createModel.userId).toBe(userId)
    expect(createModel.groupId).toBe(groupId)
    expect(createModel.groupUserRank).toBe(groupUserRank)
  })

  it('Read', async () => {
    const readModel = await model.findOne({
      where: {
        userId: userId,
        groupId: groupId
      }
    })
    expect(readModel.userId).toBe(userId)
    expect(readModel.groupId).toBe(groupId)
    expect(readModel.groupUserRank).toBe(groupUserRank)
  })

  it('Update', async () => {
    await model.update({
      groupUserRank: groupUserRankUpdated
    },
    {
      where: {
        userId: userId,
        groupId: groupId
      }
    })
    console.log('GETTING UPDATES')
    const updateModel = await model.findOne({
      where: {
        userId: userId,
        groupId: groupId
      }
    })
    expect(updateModel.userId).toBe(userId)
    expect(updateModel.groupId).toBe(groupId)
    expect(updateModel.groupUserRank).toBe(groupUserRankUpdated)
    console.log('FINISHED WITH UPDATE')
  })

  it('Delete', async () => {
    const destroyModel = await model.destroy({
      where: {
        userId: userId,
        groupId: groupId
      }
    })
    expect(destroyModel).toBe(1)
  })

  afterAll(async (done) => {
    await userModel.destroy({
      where: {
        id: userId
      }
    })

    await userRoleModel.destroy({
      where: {
        role: role
      }
    })

    await groupModel.destroy({
      where: {
        id: groupId
      }
    })

    await groupUserRankModel.destroy({
      where: {
        rank: groupUserRank
      }
    })

    await groupUserRankModel.destroy({
      where: {
        rank: groupUserRankUpdated
      }
    })

    done()
  })
})
