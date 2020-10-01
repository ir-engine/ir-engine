import '@feathersjs/transport-commons'
import { Application } from '../declarations'
import getLocalServerIp from '../util/get-local-server-ip';
import config from '../config';
import app from "../app";

export default (app: Application): void => {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return
  }

  // function pingClients (): any {
  //   console.log('PingClient')
  //   app.service('instance-provision').emit('created', {
  //     type: 'created',
  //     data: {
  //       cool: 'pants'
  //     }
  //   })
  //   setTimeout(() => pingClients(), 2000)
  // }

  app.on('connection', async (connection) => {
    if ((process.env.KUBERNETES === 'true' && config.server.mode === 'realtime') || (process.env.NODE_ENV === 'development') || config.server.mode === 'local') {
      try {
        const token = (connection as any).socketQuery?.token
        if (token != null) {
          const authResult = await app.service('authentication').strategies.jwt.authenticate({ accessToken: token }, {})
          const identityProvider = authResult['identity-provider']
          if (identityProvider != null) {
            console.log(`user ${identityProvider.userId} joining ${(connection as any).socketQuery.locationId}`);
            const userId = identityProvider.userId
            const user = await app.service('user').get(userId);
            const locationId = (connection as any).socketQuery.locationId;
            const agonesSDK = (app as any).agonesSDK;
            const gsResult = await agonesSDK.getGameServer();
            const { status } = gsResult;
            if (status.state === 'Ready' || ((process.env.NODE_ENV === 'development' && status.state === 'Shutdown') || (app as any).instance == null)) {
              console.log('Starting new instance')
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
              //   const channelName = `instanceIds/${(app as any).instance.id as string}`
              //   return app.channel(channelName).send({
              //     data: data
              //   })
              // })
              // This is how you could manually emit data on a service method
              // pingClients()
              // app.service('instance-provision').emit('created', {
              //   type: 'created',
              //   data: {
              //     cool: 'pants'
              //   }
              // })
            } else {
              console.log('Joining allocated instance')
              console.log(user.instanceId)
              console.log((app as any).instance.id)
              if (user.instanceId !== (app as any).instance.id) {
                const instance = await app.service('instance').get((app as any).instance.id)
                await app.service('instance').patch((app as any).instance.id, {
                  currentUsers: (instance.currentUsers as number) + 1
                })
              }
            }
            console.log('Patching user instanceId to ' + (app as any).instance.id)
            await app.service('user').patch(userId, {
              instanceId: (app as any).instance.id
            })
            console.log('Patched user instanceId')
            app.channel(`instanceIds/${(app as any).instance.id as string}`).join(connection)
            if (user.partyId != null) {
              const partyUserResult = await app.service('party-user').find({
                query: {
                  partyId: user.partyId
                }
              });
              const partyUsers = (partyUserResult as any).data;
              const partyOwner = partyUsers.find((partyUser) => partyUser.isOwner === 1);
              if (partyOwner.userId === userId) {
                console.log('Patching party instanceId')
                await app.service('party').patch(user.partyId, {
                  instanceId: (app as any).instance.id
                })
                const nonOwners = partyUsers.filter((partyUser) => partyUser.isOwner !== 1 && partyUser.isOwner !== true);
                const emittedIp = (process.env.KUBERNETES !== 'true') ? await getLocalServerIp() : { ipAddress: status.address, port: status.portsList[0].port}
                console.log('Emitting instance-provision to other party users:');
                console.log(emittedIp);
                await Promise.all(nonOwners.map(async partyUser => {
                  await app.service('instance-provision').emit('created', {
                    userId: partyUser.userId,
                    ipAddress: emittedIp.ipAddress,
                    port: emittedIp.port,
                    locationId: locationId
                  })
                }))
              }
            }
          }
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  })

  app.on('disconnect', async (connection) => {
    if ((process.env.KUBERNETES === 'true' && config.server.mode === 'realtime') || process.env.NODE_ENV === 'development' || config.server.mode === 'local') {
      try {
        const token = (connection as any).socketQuery?.token
        if (token != null) {
          const authResult = await app.service('authentication').strategies.jwt.authenticate({accessToken: token}, {})
          const identityProvider = authResult['identity-provider']
          if (identityProvider != null) {
            const userId = identityProvider.userId;
            const user = await app.service('user').get(userId);
            console.log('Socket disconnect from ' + userId);
            const instanceId = process.env.KUBERNETES !== 'true' ? user.instanceId : (app as any).instance?.id
            const instance = (app as any).instance ? await app.service('instance').get(instanceId) : {}
            if (user.instanceId === instanceId) {
              await app.service('instance').patch(instanceId, {
                currentUsers: instance.currentUsers - 1
              })
            }

            app.channel(`instanceIds/${instanceId as string}`).leave(connection)

            if (instance.currentUsers === 1) {
              console.log('Deleting instance ' + instanceId)
              await app.service('instance').remove(instanceId)
              if ((app as any).gsSubdomainNumber != null) {
                await app.service('gameserver-subdomain-provision').patch((app as any).gsSubdomainNumber, {
                  allocated: false
                })
              }
              if (process.env.KUBERNETES === 'true') {
                delete (app as any).instance
              }
              const gsName = (app as any).gsName;
              console.log('App\'s gameserver name:')
              console.log(gsName)
              if ((app as any).gsSubdomainNumber != null) {
                await app.service('gameserver-subdomain-provision').patch((app as any).gsSubdomainNumber, {
                  allocated: false
                })
              }
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
