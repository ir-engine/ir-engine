import app from '../../server/app'

describe('CRUD operation on \'PartyUser\' model', () => {
  const model = app.service('party-user').Model
  const partyModel = app.service('party').Model
  const userModel = app.service('user').Model
  let partyId, userId

  beforeEach(async () => {
    const party = await partyModel.create({})
    partyId = party.id
    const user = await userModel.create({})
    userId = user.id
  })

  it('Create', async () => {
    await model.create({
      isOwner: false,
      isInviteAccepted: true,
      partyId: partyId,
      userId: userId
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', async () => {
    await model.findOne({
      where: {
        isInviteAccepted: true
      }
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', async () => {
    await model.update(
      { isOwner: true },
      { where: { isInviteAccepted: true } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', async () => {
    await model.destroy({
      where: { isInviteAccepted: true }
    }).then(res => {
      done()
    }).catch(done)
  })

  afterEach(async () => {
    await userModel.destroy({
      where: {
        id: userId
      }
    })
    await partyModel.destroy({
      where: {
        id: partyId
      }
    })
  })
})
