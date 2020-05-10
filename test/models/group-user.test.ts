import app from '../../src/app'

describe('CRUD operation on \'GroupUser\' model', () => {
  const model = app.service('group-user').Model
  const userModel = app.service('user').Model
  const grpUsrRankModel = app.service('group-user-rank').Model
  var userId: any, grpUsrRank: any

  before(async () => {
    const user = await userModel.create({
      email: 'email@example.com',
      password: '12345',
      mobile: '8767367277',
      githubId: 'githubtest',
      isVerified: true
    })
    userId = user.id
    grpUsrRank = Math.random().toString()
    grpUsrRankModel.create({
      rank: grpUsrRank
    })
  })

  it('Create', done => {
    model.create({
      text: 'test',
      userId: userId,
      groupUserRank: grpUsrRank
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', done => {
    model.findOne({
      where: {
        text: 'test'
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', done => {
    model.update(
      { text: 'test1' },
      { where: { text: 'test' } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', done => {
    model.destroy({
      where: { text: 'test1' }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Should not create without userId, groupId', done => {
    model.create({
      text: 'test'
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
        userId: userId
      }
    })

    grpUsrRankModel.destroy({
      where: {
        rank: grpUsrRank
      }
    })
  })
})
