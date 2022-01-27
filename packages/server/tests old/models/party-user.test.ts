import app from '../../packages/server/src/app'

describe("CRUD operation on 'PartyUser' model", () => {
  const model = (app.service('party-user') as any).Model
  const partyModel = (app.service('party') as any).Model
  const userModel = (app.service('user') as any).Model
  let partyId, userId

  beforeAll(async () => {
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
    })
  })

  it('Read', async () => {
    await model.findOne({
      where: {
        isInviteAccepted: true
      }
    })
  })

  it('Update', async () => {
    await model.update({ isOwner: true }, { where: { isInviteAccepted: true } })
  })

  it('Delete', async () => {
    await model.destroy({
      where: { isInviteAccepted: true }
    })
  })

  afterAll(async () => {
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
