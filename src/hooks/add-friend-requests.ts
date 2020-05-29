import { Op } from 'sequelize'
export default function (options = {}) {
  return async (context: any) => {
    const { app, params } = context
    const userModel = app.service('user').Model
    const userId = params.connection['identity-provider'].userId
    const friendRequests = await app.service('conversation').Model.findAll({
      where: {
        [Op.or]: [{ firstuserId: userId }, { seconduserId: userId }],
        type: 'user',
        status: false
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
    context.result.friedRequests = friendRequests
    return context
  }
}
