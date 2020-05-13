import app from '../../src/app'

describe('CRUD operation on \'GroupUser\' model', () => {
  const model = app.service('group-user').Model
  const userModel = app.service('user').Model
  const groupModel = app.service('group').Model
  const groupUserRankModel = app.service('group-user-rank').Model
  let userId: any, groupUserRank: any, groupUserRankUpdated: any, groupId: any

  before(async () => {
    const user = await userModel.create({
      name: 'testname',
      userRole: 'user'
    })
    const group = await groupModel.create({
      name: 'testgroup'
    })
    const groupUserRankInstance = await groupUserRankModel.create({
      rank: 'uberleader'
    })
    const groupUserRankInstanceUpdated = await groupUserRankModel.create({
      rank: 'updated-uberleader'
    })
    userId = user.id
    groupId = group.id
    groupUserRank = groupUserRankInstance.rank
    groupUserRankUpdated = groupUserRankInstanceUpdated.rank
  })

  it('Create', done => {
    model.create({
      userId,
      groupId,
      groupUserRank: groupUserRank
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        userId,
        groupId
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { groupUserRank: groupUserRankUpdated },
      { where: { userId, groupId } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { userId, groupId }
    }).then(res => {
      done()
    }).catch(done)
  })

  after(async () => {
    await userModel.destroy({
      where: {
        id: userId
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
