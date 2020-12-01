import '@feathersjs/transport-commons';
import { Application } from '../declarations';
import getLocalServerIp from '../util/get-local-server-ip';
import config from '../config';
import app from "../app";
import { Network } from '@xr3ngine/engine/src/networking/components/Network';
import logger from './logger';
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab';
import { staticWorldColliders } from '@xr3ngine/engine/src/templates/car/prefabs/staticWorldColliders';

import isNullOrUndefined from '@xr3ngine/engine/src/common/functions/isNullOrUndefined';
import { loadScene } from "@xr3ngine/engine/src/scene/functions/SceneLoading";

let forTest = 0;

export default (app: Application): void => {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return;
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
        const token = (connection as any).socketQuery?.token;
        if (token != null) {
          const authResult = await app.service('authentication').strategies.jwt.authenticate({ accessToken: token }, {});
          const identityProvider = authResult['identity-provider'];
          if (identityProvider != null) {
            logger.info(`user ${identityProvider.userId} joining ${(connection as any).socketQuery.locationId} with sceneId ${(connection as any).socketQuery.sceneId}`);
            const userId = identityProvider.userId;
            const user = await app.service('user').get(userId);
            const locationId = (connection as any).socketQuery.locationId;
            const sceneId = (connection as any).socketQuery.sceneId;

            if(sceneId === "") return console.warn("Scene ID is empty, can't init");

            const agonesSDK = (app as any).agonesSDK;
            const gsResult = await agonesSDK.getGameServer();
            const { status } = gsResult;
            if (status.state === 'Ready' || ((process.env.NODE_ENV === 'development' && status.state === 'Shutdown') || (app as any).instance == null)) {
              logger.info('Starting new instance');
              const localIp = await getLocalServerIp();
              const selfIpAddress = `${(status.address as string)}:${(status.portsList[0].port as string)}`;
              const instanceResult = await app.service('instance').create({
                currentUsers: 1,
                locationId: locationId,
                sceneId: sceneId,
                ipAddress: config.server.mode === 'local' ? `${localIp.ipAddress}:3030` : selfIpAddress
              });
              await agonesSDK.allocate();
              (app as any).instance = instanceResult;



                let service, serviceId;
                const projectRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/;
                const projectResult = await app.service('project').get(sceneId);
                console.log("Project result is: ", projectResult);
                const projectUrl = projectResult.project_url;
                const regexResult = projectUrl.match(projectRegex);
                if (regexResult) {
                  service = regexResult[1];
                  serviceId = regexResult[2];
                }
                const result = await app.service(service).get(serviceId);
                console.log("Result is ");
                console.log(result);

                if (!forTest) {
                  loadScene(result);
                  forTest += 1;
                }



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
              // console.log('Joining allocated instance');
              // console.log(user.instanceId);
              // console.log((app as any).instance.id);
              const instance = await app.service('instance').get((app as any).instance.id);
              await app.service('instance').patch((app as any).instance.id, {
                currentUsers: (instance.currentUsers as number) + 1
              });
            }
            // console.log(`Patching user ${user.id} instanceId to ${(app as any).instance.id}`);
            await app.service('user').patch(userId, {
              instanceId: (app as any).instance.id
            });
            (connection as any).instanceId = (app as any).instance.id;
            // console.log('Patched user instanceId');
            app.channel(`instanceIds/${(app as any).instance.id as string}`).join(connection);
            if (user.partyId != null) {
              const partyUserResult = await app.service('party-user').find({
                query: {
                  partyId: user.partyId
                }
              });
              const party = await app.service('party').get(user.partyId);
              const partyUsers = (partyUserResult as any).data;
              const partyOwner = partyUsers.find((partyUser) => partyUser.isOwner === 1);
              if (partyOwner?.userId === userId && party.instanceId !== (app as any).instance.id) {
                await app.service('party').patch(user.partyId, {
                  instanceId: (app as any).instance.id
                });
                const nonOwners = partyUsers.filter((partyUser) => partyUser.isOwner !== 1 && partyUser.isOwner !== true);
                const emittedIp = (process.env.KUBERNETES !== 'true') ? await getLocalServerIp() : { ipAddress: status.address, port: status.portsList[0].port };
                await Promise.all(nonOwners.map(async partyUser => {
                  await app.service('instance-provision').emit('created', {
                    userId: partyUser.userId,
                    ipAddress: emittedIp.ipAddress,
                    port: emittedIp.port,
                    locationId: locationId,
                    sceneId: sceneId
                  });
                }));
              }
            }
          }
        }
      } catch (err) {
        logger.error(err);
        throw err;
      }
    }
  });

  app.on('disconnect', async (connection) => {
    if ((process.env.KUBERNETES === 'true' && config.server.mode === 'realtime') || process.env.NODE_ENV === 'development' || config.server.mode === 'local') {
      try {
        const token = (connection as any).socketQuery?.token;
        if (token != null) {
          const authResult = await app.service('authentication').strategies.jwt.authenticate({ accessToken: token }, {});
          const identityProvider = authResult['identity-provider'];
          if (identityProvider != null) {
            const userId = identityProvider.userId;
            const user = await app.service('user').get(userId);
            logger.info('Socket disconnect from ' + userId);
            const instanceId = process.env.KUBERNETES !== 'true' ? (connection as any).instanceId : (app as any).instance?.id;
            const instance = ((app as any).instance && instanceId != null) ? await app.service('instance').get(instanceId) : {};
            console.log('instanceId: ' + instanceId);
            console.log('user instanceId: ' + user.instanceId);

            if (instanceId != null) {
              await app.service('instance').patch(instanceId, {
                currentUsers: --instance.currentUsers
              }).catch((err) => {
                console.warn("Failed to remove user, probably because instance was destroyed");
              });

              const user = await app.service('user').get(userId);
              if (Network.instance.clients[userId] == null && process.env.KUBERNETES === 'true') await app.service('user').patch(null, {
                instanceId: null
              }, {
                query: {
                  id: user.id,
                  instanceId: instanceId
                },
                instanceId: instanceId
              }).catch((err) => {
                console.warn("Failed to patch user, probably because they don't have an ID yet");
                console.log(err);
              });

              app.channel(`instanceIds/${instanceId as string}`).leave(connection);

              if (instance.currentUsers < 1) {
                console.log('Deleting instance ' + instanceId);
                await app.service('instance').remove(instanceId);
                if ((app as any).gsSubdomainNumber != null) {
                  const gsSubdomainProvision = await app.service('gameserver-subdomain-provision').find({
                    query: {
                      gs_number: (app as any).gsSubdomainNumber
                    }
                  });
                  await app.service('gameserver-subdomain-provision').patch(gsSubdomainProvision.data[0].id, {
                    allocated: false
                  });
                }
                if (process.env.KUBERNETES === 'true') {
                  delete (app as any).instance;
                }
                const gsName = (app as any).gsName;
                if (gsName !== undefined) {
                  logger.info('App\'s gameserver name:');
                  logger.info(gsName);
                }
                await (app as any).agonesSDK.shutdown();
              }
            }
          }
        }
      } catch (err) {
        logger.info(err);
        throw err;
      }
    }
  });

  app.on('login', (authResult: any, { connection }: any) => {
    if (connection) {
      app.channel(`userIds/${connection['identity-provider'].userId as string}`).join(connection);
    }
  });

  app.on('logout', (authResult: any, { connection }: any) => {
    if (connection) {
      app.channel(`userIds/${connection['identity-provider'].userId as string}`).leave(connection);
    }
  });

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
};
