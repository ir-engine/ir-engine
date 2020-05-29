import '@feathersjs/transport-commons'
import { HookContext } from '@feathersjs/feathers'
import { Application } from './declarations'
import { Op } from 'sequelize'

export default (app: Application): void => {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return
  }

  app.on('connection', (connection: any) => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('anonymous').join(connection)
  })

  app.on('login', (authResult: any, { connection }: any) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if (connection) {
      // Obtain the logged in user from the connection
      // const user = connection.user

      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection)

      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection)

      const userId = connection['identity-provider'].userId

      app.service('chatroom').emit('userStatus', {
        type: 'online',
        userId: connection['identity-provider'].userId
      })

      app.service('conversation').Model.findAll({
        where: {
          [Op.or]: [{ firstuserId: userId }, { seconduserId: userId }],
          type: 'user'
        }
      }).then((res: any) => {
        res.forEach((cnvrs: any) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          app.channel(`chatroom/user/${cnvrs.id}`).join(connection)
        })
      })

      app.service('group-user').Model.findAll({
        where: {
          userId: userId
        }
      }).then((res: any) => {
        res.forEach((groupUser: any) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          app.channel(`chatroom/group/${groupUser.groupId}`).join(connection)
        })
      })

      app.service('party-user').Model.findAll({
        where: {
          userId: userId
        }
      }).then((res: any) => {
        res.forEach((partyUser: any) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          app.channel(`chatroom/party/${partyUser.partyId}`).join(connection)
        })
      })

      // Channels can be named anything and joined on any condition

      // E.g. to send real-time events only to admins use
      // if(user.isAdmin) { app.channel('admins').join(connection) }

      // If the user has joined e.g. chat rooms
      // if(Array.isArray(user.rooms)) user.rooms.forEach(room => app.channel(`rooms/${room.id}`).join(channel))

      // Easily organize user by email and userid for things like messaging
      // app.channel(`emails/${user.email}`).join(channel)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      app.channel(`userIds/${connection['identity-provider'].userId}`).join(connection)
    }
  })

  app.on('logout', (authResult: any, { connection }: any) => {
    if (connection) {
      // Join the channels a logged out connection should be in
      app.channel('anonymous').join(connection)
    }
    const user = authResult['identity-provider']
    if (user) {
      app.service('chatroom').emit('userStatus', {
        type: 'offline',
        userId: connection['identity-provider'].userId
      })
    }
  })

  app.on('disconnect', (connection: any) => {
    app.service('chatroom').emit('userStatus', {
      type: 'offline',
      userId: connection['identity-provider']?.userId
    })
  })

  app.publish((data: any, hook: HookContext) => {
    // Here you can add event publishers to channels set up in `channels.js`
    // To publish only for a specific event use `app.publish(eventname, () => {})`

    // console.log(data)

    // console.log(hook)

    // console.log('Publishing all events to all authenticated user. See `channels.js` and https://docs.feathersjs.com/api/channels.html for more information.') // eslint-disable-line

    // e.g. to publish all service events to all authenticated user use
    return app.channel('authenticated')
  })

  // Here you can also add service specific event publishers
  // e.g. the publish the `user` service `created` event to the `admins` channel
  // app.service('user').publish('created', () => app.channel('admins'))

  // With the userid and email group from above you can easily select involved user
  // app.service('message').publish(() => {
  //   return [
  //     app.channel(`userIds/${data.createdBy}`),
  //     app.channel(`emails/${data.recipientEmail}`)
  //   ]
  // })

  app.service('message').publish('created', data => {
    // console.log(data)
    if (data.conversation.type === 'group') {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return app.channel(`chatroom/group/${data.conversation.groupId}`).send(data)
    } else if (data.conversation.type === 'party') {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return app.channel(`chatroom/party/${data.conversation.partyId}`).send(data)
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return app.channel(`chatroom/user/${data.conversation.id}`).send(data)
    }
  })

  app.service('message').publish('updated', data => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return app.channel(`userIds/${data.message.senderId}`).send(data)
  })

  app.service('chatroom').publish('userStatus', async data => {
    const conversation = await app.service('conversation').Model.findAll({
      where: {
        [Op.or]: [{ firstuserId: data.userId }, { seconduserId: data.userId }]
      }
    })
    const channels: any[] = []
    conversation.forEach((item: any) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      channels.push(app.channel(`chatroom/user/${item.id}`).send(data))
    })

    const groups = await app.service('group-user').Model.findAll({
      where: {
        userId: data.userId
      }
    })
    groups.forEach((item: any) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      channels.push(app.channel(`chatroom/group/${item.groupId}`).send(data))
    })

    const party = await app.service('party-user').Model.findOne({
      where: {
        userId: data.userId
      }
    })
    if (party) {
      if (Object.keys(party).length) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        channels.push(app.channel(`chatroom/party/${party.partyId}`).send(data))
      }
    }
    return channels
  })

  app.service('chatroom').publish('party', async data => {
    if (data.type === 'party_join_request') {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return app.channel(`chatroom/userIds/${data.userId}`).send(data)
    }
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return app.channel(`chatroom/party/${data.partyId}`).send(data)
  })

  app.service('chatroom').publish('conversation', async data => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return app.channel(`chatroom/user/${data.conversation.id}`).send(data)
  })
}
