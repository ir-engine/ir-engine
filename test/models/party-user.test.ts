import app from '../../server/app'

describe('CRUD operation on \'PartyUser\' model', () => {
  const model = app.service('party-user').Model
  const partyModel = app.service('party').Model
  const userModel = app.service('user').Model
  let partyId, userId

<<<<<<< HEAD
  beforeAll(async () => {
=======
  beforeEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    const party = await partyModel.create({})
    partyId = party.id
    const user = await userModel.create({})
    userId = user.id
  })

<<<<<<< HEAD
  it('Create', async () => {
=======
  it('Create', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.create({
      isOwner: false,
      isInviteAccepted: true,
      partyId: partyId,
      userId: userId
<<<<<<< HEAD
    })
  })

  it('Read', async () => {
=======
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Read', async done => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
    await model.findOne({
      where: {
        isInviteAccepted: true
      }
<<<<<<< HEAD
    })
  })

  it('Update', async () => {
    await model.update(
      { isOwner: true },
      { where: { isInviteAccepted: true } }
    )
  })

  it('Delete', async () => {
    await model.destroy({
      where: { isInviteAccepted: true }
    })
  })

  afterAll(async () => {
=======
    }).then(res => {
      done()
    }).catch(done)
  })

  it('Update', async done => {
    await model.update(
      { isOwner: true },
      { where: { isInviteAccepted: true } }
    ).then(res => {
      done()
    }).catch(done)
  })

  it('Delete', async done => {
    await model.destroy({
      where: { isInviteAccepted: true }
    }).then(res => {
      done()
    }).catch(done)
  })

  afterEach(async () => {
>>>>>>> Added old tests, converted to Jest from Mocha, 60% of tests passing
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
