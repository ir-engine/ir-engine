import { Hook, HookContext } from '@feathersjs/feathers'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    const { data, app } = context
    let messageProp: string
    // eslint-disable-next-line no-prototype-builtins
    if (data.hasOwnProperty('isDelivered')) {
      messageProp = 'isDelivered'
    } else {
      messageProp = 'isRead'
    }

    // if (messageProp === 'isRead') {
    //   app.get('sequelizeClient').query()
    // }
    const message = await app.service('message').Model.findOne({
      where: {
        id: data.messageId
      }
    })

    const messageStatus = await app.service('message-status').Model.findAll({
      where: {
        [messageProp]: false,
        messageId: data.messageId
      }
    })

    if (messageStatus.length === 0 && message[messageProp] === false) {
      app.service('message').Model.update(
        { [messageProp]: true },
        { where: { messageId: data.messageId } }
      )
    }

    return context
  }
}
