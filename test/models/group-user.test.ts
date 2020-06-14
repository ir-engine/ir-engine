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

<<<<<<< HEAD
  beforeAll(async () => {
=======
  beforeEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
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

<<<<<<< HEAD
  it('Create', async () => {
=======
  it('Create', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.create({
      userId,
      groupId,
      groupUserRank
    })
  })

<<<<<<< HEAD
  it('Read', async () => {
=======
  it('Read', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.findOne({
      where: {
        userId,
        groupId
      }
    })
  })

<<<<<<< HEAD
  it('Update', async () => {
=======
  it('Update', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.update(
      { groupUserRank: groupUserRankUpdated },
      { where: { userId, groupId } }
    )
  })

<<<<<<< HEAD
  it('Delete', async () => {
=======
  it('Delete', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.destroy({
      where: { userId, groupId }
    })
  })

<<<<<<< HEAD
  afterAll(async () => {
=======
  afterEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
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
