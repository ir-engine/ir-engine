import app from '../../src/app'

describe('CRUD operation on \'GroupUser\' model', () => {
  const model = app.service('group-user').Model
  const userModel = app.service('user').Model
  const groupModel = app.service('group').Model
  const groupUserRankModel = app.service('group-user-rank').Model
  let userId: any, groupUserRank: any, groupUserRankUpdated: any, groupId: any

  before(async () => {
    const user = await userModel.create({
      name: 'testname'
    })
    const group = await groupModel.create({
      name: 'testgroup'
    })
    const groupUserRankRank = await groupUserRankModel.create({
      rank: 'uberleader'
    })
    const groupUserRankRankUpdated = await groupUserRankModel.create({
      rank: 'updated-uberleader'
    })
    userId = user.id
    groupId = group.id
    groupUserRank = groupUserRankRank.rank
    groupUserRankUpdated = groupUserRankRankUpdated.rank
  })

  it('Create', done => {
    model.create({
      userId,
      groupId,
      rank: groupUserRank
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
      { rank: groupUserRankUpdated },
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

  it('Should not create without userId, groupId', done => {
    model.create({
    }).then(res => {
      const err = new Error('Group user created without foreign keys.')
      done(err)
    }).catch(_err => {
      done()
    })
  })

  after(() => {
    userModel.destroy({
      where: {
        id: userId
      }
    })

    groupModel.destroy({
      where: {
        id: groupId
      }
    })

    groupUserRankModel.destroy({
      where: {
        rank: groupUserRank
      }
    })

    groupUserRankModel.destroy({
      where: {
        rank: groupUserRankUpdated
      }
    })
  })
})
