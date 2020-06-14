import app from '../../server/app'

describe('CRUD operation on \'GroupUser\' model', () => {
  const model = app.service('group-user').Model
  const userModel = app.service('user').Model
  const userRoleModel = app.service('user-role').Model
  const groupModel = app.service('group').Model
  const groupUserRankModel = app.service('group-user-rank').Model
  const userName = 'testname'
  const groupUserRank = 'uberleader'
  const groupUserRankUpdated = 'updated-uberleader'
  const group = 'testgroup'
  const role = 'testrole'
  let userId: string
  let groupId: string

  beforeEach(async () => {
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

    userId = await userModel.findOne({
      where: { name: userName }
    }).id

    groupId = await groupModel.findOne({
      where: { name: group }
    }).id
  })

  it('Create', async done => {
    await model.create({
      userId,
      groupId,
      groupUserRank
    })
  })

  it('Read', async done => {
    await model.findOne({
      where: {
        userId,
        groupId
      }
    })
  })

  it('Update', async done => {
    await model.update(
      { groupUserRank: groupUserRankUpdated },
      { where: { userId, groupId } }
    )
  })

  it('Delete', async done => {
    await model.destroy({
      where: { userId, groupId }
    })
  })

  afterEach(async () => {
    await userModel.destroy({
      where: {
        id: userId
      }
    })

    await userRoleModel.destroy({
      where: {
        role
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
  })
})
