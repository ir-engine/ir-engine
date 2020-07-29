import '@feathersjs/transport-commons'
import { HookContext } from '@feathersjs/feathers'
import { Application } from './declarations'

export default (app: Application): void => {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return
  }

  app.on('login', (authResult: any, { connection }: any) => {
    if (connection) {
      app.channel(`userIds/${connection['identity-provider'].userId}`).join(connection)
    }
  })
  //
  // app.publish((data: any, hook: HookContext) => {
  //   // Here you can add event publishers to channels set up in `channels.js`
  //   // To publish only for a specific event use `app.publish(eventname, () => {})`
  //
  //   // console.log(data)
  //
  //   // console.log(hook)
  //
  //   // console.log('Publishing all events to all authenticated user. See `channels.js` and https://docs.feathersjs.com/api/channels.html for more information.') // eslint-disable-line
  //
  //   // e.g. to publish all service events to all authenticated user use
  //   return app.channel('authenticated')
  // })

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

  app.service('message').publish('created', async (data): Promise<any> =>  {
    console.log('Publishing message sent notification')
    console.log(data)
    const channel = await app.service('channel').get(data.channelId)
    console.log('Channel:')
    console.log(channel)
    let targetIds = []
    if (channel.channelType === 'party') {
      console.log('Sending party message notification')
      const partyUsers = await app.service('party-user').find({
        query: {
          partyId: channel.partyId
        }
      })

      console.log(partyUsers)

      targetIds = (partyUsers as any).data.map((partyUser) => {
        return partyUser.userId
      })
    }
    else if (channel.channelType === 'group') {
      console.log('Sending group message notification')
      const groupUsers = await app.service('group-user').find({
        query: {
          groupId: channel.groupId
        }
      })

      console.log(groupUsers)

      targetIds = (groupUsers as any).data.map((groupUser) => {
        return groupUser.userId
      })
    }
    else if (channel.channelType === 'user') {
      console.log('Sending friend message notification')
      targetIds = [channel.userId1, channel.userId2]
    }
    console.log('User IDs to send notification to:')
    console.log(targetIds)
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Promise.all(targetIds.map((userId) => {
      console.log('Sending notification to user ' + userId)
      return app.channel(`userIds/${userId}`).send({
        channelType: channel.channelType,
        message: data
      })
    }))
  })
}
