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
}
