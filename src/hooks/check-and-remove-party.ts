import app from '../app'

export default async function (partyUser: any): Promise<void> {
  const model = app.service('party-user').Model
  const partyModel = app.service('party').Model
  const conversationModel = app.service('conversation').Model
  const messageModel = app.service('message').Model
  const messageStatusModel = app.service('message-status').Model
  const partyUsers = await model.findAll({
    where: {
      partyId: partyUser.partyId
    }
  })
  if (partyUsers.length < 2) {
    await model.destroy({
      where: {
        partyId: partyUser.partyId
      }
    })
    try {
      await partyModel.destroy({
        where: {
          id: partyUser.partyId
        },
        include: [
          {
            model: conversationModel,
            include: [
              {
                model: messageModel,
                include: [
                  {
                    model: messageStatusModel
                  }
                ]
              }
            ]
          }
        ]
      })
    } catch (err) {
      console.log(err)
    }
  }
}
