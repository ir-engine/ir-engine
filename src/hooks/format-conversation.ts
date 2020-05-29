export default function (options = {}) {
  return async (context: any) => {
    const { app, result } = context
    const userModel = app.service('user').Model
    const conversationModel = app.service('conversation').Model
    const conversation = await conversationModel.findOne({
      where: {
        id: result.id
      },
      include: [
        {
          model: userModel,
          attributes: ['id', 'name'],
          as: 'firstuser'
        },
        {
          model: userModel,
          attributes: ['id', 'name'],
          as: 'seconduser'
        }
      ]
    })

    context.result = conversation
    return context
  }
}
