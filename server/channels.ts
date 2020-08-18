import '@feathersjs/transport-commons'
import { Application } from './declarations'

export default (app: Application): void => {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return
  }

  app.on('connection', async (connection) => {
    console.log(connection)
    if ((process.env.KUBERNETES === 'true' && process.env.SERVER_MODE === 'realtime') || (process.env.NODE_ENV === 'development')) {
      try {
        const token = (connection as any).socketQuery?.token
        if (token != null) {
          const authResult = await app.service('authentication').strategies.jwt.authenticate({ accessToken: token }, {})
          const identityProvider = authResult['identity-provider']
          if (identityProvider != null) {
            const userId = identityProvider.userId
            const locationId = (connection as any).socketQuery.locationId
            const agonesSDK = (app as any).agonesSDK
            const gsResult = await agonesSDK.getGameServer()
            const { status } = gsResult
            if (status.state === 'Ready' || (process.env.NODE_ENV === 'development' && status.state === 'Shutdown')) {
              const selfIpAddress = `${(status.address as string)}:${(status.portsList[0].port as string)}`
              const instanceResult = await app.service('instance').create({
                currentUsers: 1,
                locationId: locationId,
                ipAddress: selfIpAddress
              })
              await agonesSDK.allocate();
              (app as any).instance = instanceResult
              // Here's an example of sending data to the channel 'instanceIds/<instanceId>'
              // This .publish is a publish handler that controls which connections to send data to.
              // app.service('instance-provision').publish('created', async (data): Promise<any> => {
              //   const channelName = `instanceIds/${(app as any).instance.id}`
              //   return app.channel(channelName).send({
              //      data: data
              //   })
              // })
              //  This is how you could manually emit data on a service method
              //  app.service('instance-provision').emit('created', {
              //   type: 'created',
              //   data: {
              //     cool: 'pants'
              //   }
              // })
            } else {
              const instance = await app.service('instance').get((app as any).instance.id)
              await app.service('instance').patch((app as any).instance.id, {
                currentUsers: (instance.currentUsers as number) + 1
              })
            }
            await app.service('user').patch(userId, {
              instanceId: (app as any).instance.id
            })
            app.channel(`instanceIds/${(app as any).instance.id as string}`).join(connection)
            console.log(app.channels)
          }
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  })

  app.on('disconnect', async (connection) => {
    console.log(connection)
    if ((process.env.KUBERNETES === 'true' && process.env.SERVER_MODE === 'realtime') || (process.env.NODE_ENV === 'development')) {
      try {
        const token = (connection as any).socketQuery?.token
        if (token != null) {
          const authResult = await app.service('authentication').strategies.jwt.authenticate({accessToken: token}, {})
          const identityProvider = authResult['identity-provider']
          if (identityProvider != null) {
            const userId = identityProvider.userId
            await app.service('user').patch(userId, {
              instanceId: null
            })
            const instance = await app.service('instance').get((app as any).instance.id)
            await app.service('instance').patch((app as any).instance.id, {
              currentUsers: instance.currentUsers - 1
            })

            app.channel(`instanceIds/${(app as any).instance.id as string}`).leave(connection)

            if (instance.currentUsers === 1) {
              await app.service('instance').remove((app as any).instance.id)
              delete (app as any).instance
              await (app as any).agonesSDK.shutdown()
            }
          }
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  })

  app.on('login', (authResult: any, { connection }: any) => {
    if (connection) {
      app.channel(`userIds/${connection['identity-provider'].userId as string}`).join(connection)
    }
  })

  app.on('logout', (authResult: any, { connection }: any) => {
    if (connection) {
      app.channel(`userIds/${connection['identity-provider'].userId as string}`).leave(connection)
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
